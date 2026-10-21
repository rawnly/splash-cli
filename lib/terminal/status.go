package terminal

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"unicode"

	"golang.org/x/term"
)

// ProgramStatus reports the root record of the OSC 7501 Program Status Protocol.
// Reports are best-effort: terminal write errors must not fail the command.
type ProgramStatus struct {
	mu       sync.Mutex
	writer   io.Writer
	enabled  bool
	started  bool
	finished bool
}

type statusContextKey struct{}

func WithProgramStatus(ctx context.Context, status *ProgramStatus) context.Context {
	return context.WithValue(ctx, statusContextKey{}, status)
}

// Status returns a nil-safe reporter, including when no reporter is installed.
func Status(ctx context.Context) *ProgramStatus {
	status, _ := ctx.Value(statusContextKey{}).(*ProgramStatus)
	return status
}

func NewProgramStatus(writer io.Writer, enabled bool) *ProgramStatus {
	return &ProgramStatus{writer: writer, enabled: enabled && writer != nil}
}

// SupportsProgramStatus allows reports on interactive output only. Detection is
// intentionally not queried: unsupported terminals ignore unknown OSC sequences.
func SupportsProgramStatus(writer io.Writer) bool {
	file, ok := writer.(*os.File)
	return ok && term.IsTerminal(int(file.Fd())) && os.Getenv("TERM") != "dumb"
}

// Disable suppresses reports for plain output, even if a terminal is attached.
func (s *ProgramStatus) Disable() {
	if s == nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.enabled = false
}

// Report sends a complete record. kind is used only with the blocked state.
func (s *ProgramStatus) Report(state, kind, message string) {
	if s == nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.reportLocked(state, kind, message)
}

func (s *ProgramStatus) reportLocked(state, kind, message string) {
	if !s.enabled || s.finished {
		return
	}
	switch state {
	case "idle", "working", "done", "blocked", "error":
	default:
		return
	}
	s.started = true
	body := "state=" + state + ":app=splash-cli"
	if state == "blocked" && (kind == "permission" || kind == "question" || kind == "auth") {
		body += ":kind=" + kind
	}
	if message = statusMessage(message); message != "" {
		body += ":msg=" + base64.StdEncoding.EncodeToString([]byte(message))
	}
	_, _ = fmt.Fprint(s.writer, "\x1b]7501;"+body+"\x1b\\")
}

// Finish leaves the final result and prevents late work from replacing it.
// Errors are reported even if argument validation failed before work began.
// Successful help, version, and completion output never creates a record.
func (s *ProgramStatus) Finish(state, message string) {
	if s == nil {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.started || state == "error" {
		s.reportLocked(state, "", message)
		s.finished = true
	}
}

// OSC 7501 messages are single-line UTF-8, without C0/C1 controls, and at
// most 2048 decoded bytes (2732 bytes of standard base64).
func statusMessage(message string) string {
	var b strings.Builder
	for _, r := range strings.ToValidUTF8(message, "�") {
		if unicode.IsControl(r) {
			continue
		}
		if b.Len()+len(string(r)) > 2048 {
			break
		}
		b.WriteRune(r)
	}
	return b.String()
}
