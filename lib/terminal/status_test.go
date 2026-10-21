package terminal

import (
	"bytes"
	"encoding/base64"
	"errors"
	"io"
	"os"
	"strings"
	"testing"
	"unicode"
	"unicode/utf8"
)

func TestProgramStatusReports(t *testing.T) {
	var out bytes.Buffer
	status := NewProgramStatus(&out, true)
	status.Report("working", "", "Downloading photo")
	status.Report("blocked", "permission", "Set wallpaper?")
	status.Report("working", "permission", "Setting wallpaper")
	status.Finish("done", "Wallpaper set")

	want := "\x1b]7501;state=working:app=splash-cli:msg=" + base64.StdEncoding.EncodeToString([]byte("Downloading photo")) + "\x1b\\" +
		"\x1b]7501;state=blocked:app=splash-cli:kind=permission:msg=" + base64.StdEncoding.EncodeToString([]byte("Set wallpaper?")) + "\x1b\\" +
		"\x1b]7501;state=working:app=splash-cli:msg=" + base64.StdEncoding.EncodeToString([]byte("Setting wallpaper")) + "\x1b\\" +
		"\x1b]7501;state=done:app=splash-cli:msg=" + base64.StdEncoding.EncodeToString([]byte("Wallpaper set")) + "\x1b\\"
	if out.String() != want {
		t.Fatalf("reports = %q, want %q", out.String(), want)
	}
}

func TestProgramStatusStatesAndKinds(t *testing.T) {
	for _, state := range []string{"idle", "working", "done", "blocked", "error"} {
		t.Run(state, func(t *testing.T) {
			var out bytes.Buffer
			status := NewProgramStatus(&out, true)
			status.Report(state, "invalid", "")
			want := "\x1b]7501;state=" + state + ":app=splash-cli\x1b\\"
			if out.String() != want {
				t.Fatalf("report = %q, want %q", out.String(), want)
			}
		})
	}
	for _, kind := range []string{"permission", "question", "auth"} {
		t.Run(kind, func(t *testing.T) {
			var out bytes.Buffer
			NewProgramStatus(&out, true).Report("blocked", kind, "")
			if !strings.Contains(out.String(), ":kind="+kind) {
				t.Fatalf("missing kind: %q", out.String())
			}
		})
	}
}

func TestProgramStatusSuppression(t *testing.T) {
	var out bytes.Buffer
	status := NewProgramStatus(&out, true)
	status.Finish("done", "No command ran")
	status.Report("invalid", "", "")
	status.Disable()
	status.Report("working", "", "Disabled")
	status.Finish("done", "Disabled")
	NewProgramStatus(&out, false).Report("working", "", "Disabled")
	if out.Len() != 0 {
		t.Fatalf("unexpected reports: %q", out.String())
	}
	var absent *ProgramStatus
	absent.Disable()
	absent.Report("working", "", "")
	absent.Finish("done", "")
}

func TestStatusMessage(t *testing.T) {
	for _, message := range []string{
		"line\nwith\tcontrols\x00\x1b\x7f\u0085",
		"Unicode: 日本語 🌊 : ; =",
		strings.Repeat("🌊", 1000),
		strings.Repeat("a", 2047) + "🌊",
		"invalid\xffUTF-8",
	} {
		t.Run(message[:min(len(message), 30)], func(t *testing.T) {
			var out bytes.Buffer
			NewProgramStatus(&out, true).Report("working", "", message)
			report := out.String()
			_, encoded, ok := strings.Cut(report, ":msg=")
			if !ok {
				t.Fatal("missing message")
			}
			encoded = strings.TrimSuffix(encoded, "\x1b\\")
			decoded, err := base64.StdEncoding.DecodeString(encoded)
			if err != nil {
				t.Fatal(err)
			}
			if len(report) > 4096 || len(encoded) > 2732 || len(decoded) > 2048 || !utf8.Valid(decoded) {
				t.Fatal("invalid protocol limits or UTF-8")
			}
			if strings.ContainsFunc(string(decoded), unicode.IsControl) {
				t.Fatalf("message contains controls: %q", decoded)
			}
		})
	}
	if got := statusMessage("hello 🌊"); got != "hello 🌊" {
		t.Fatalf("valid message changed: %q", got)
	}
}

func TestProgramStatusContext(t *testing.T) {
	if Status(t.Context()) != nil {
		t.Fatal("unexpected reporter")
	}
	status := NewProgramStatus(io.Discard, false)
	if Status(WithProgramStatus(t.Context(), status)) != status {
		t.Fatal("reporter not preserved in context")
	}
}

func TestSupportsProgramStatus(t *testing.T) {
	if SupportsProgramStatus(&bytes.Buffer{}) {
		t.Fatal("buffer should not receive escape sequences")
	}
	file, err := os.CreateTemp(t.TempDir(), "output")
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	if SupportsProgramStatus(file) {
		t.Fatal("redirected output should not receive escape sequences")
	}
	t.Setenv("TERM", "dumb")
	if SupportsProgramStatus(os.Stdout) {
		t.Fatal("dumb terminal should not receive escape sequences")
	}
}

type failingStatusWriter struct{}

func (failingStatusWriter) Write([]byte) (int, error) {
	return 0, errors.New("terminal closed")
}

func TestProgramStatusWriteErrorIsBestEffort(t *testing.T) {
	NewProgramStatus(failingStatusWriter{}, true).Report("working", "", "Still runs")
}
