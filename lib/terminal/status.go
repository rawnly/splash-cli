package terminal

import (
	"encoding/base64"
	"fmt"
	"os"
)

// Blocked reports (OSC 7501, Program Status Protocol) that the program is
// waiting for user input. The returned func reports it is working again.
//
// Reports are best-effort and only sent to interactive terminals; terminals
// that don't support the protocol ignore the sequence.
//
//	defer terminal.Blocked("question", "Do you like this photo?")()
func Blocked(kind, message string) (resume func()) {
	report("blocked", kind, message)
	return func() { report("working", "", "") }
}

func report(state, kind, message string) {
	if !isInteractive() {
		return
	}

	body := "state=" + state + ":app=splash-cli"
	if kind != "" {
		body += ":kind=" + kind
	}
	if message != "" {
		body += ":msg=" + base64.StdEncoding.EncodeToString([]byte(truncate(message)))
	}

	fmt.Fprint(os.Stdout, "\x1b]7501;"+body+"\x1b\\")
}

func isInteractive() bool {
	info, err := os.Stdout.Stat()
	return err == nil && info.Mode()&os.ModeCharDevice != 0 && os.Getenv("TERM") != "dumb"
}

// messages are limited to 2048 bytes
func truncate(s string) string {
	if len(s) <= 2048 {
		return s
	}
	return s[:2048]
}
