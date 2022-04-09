package terminal

import (
	"fmt"
	"github.com/briandowns/spinner"
	"strings"
)

const (
	ESC string = "\u001B["
	OSC string = "\u001B]"
	BEL string = "\u0007"
	SEP string = ";"
)

func Link(text string, url string) {
	seq := []string{
		OSC,
		"8",
		SEP,
		SEP,
		url,
		BEL,
		text,
		OSC,
		"8",
		SEP,
		SEP,
		BEL,
	}

	fmt.Println(strings.Join(seq, ""))
}

type Spinner struct {
	Spinner spinner.Spinner
	Text    string
}

func (s *Spinner) Fail(message string) {
	s.Spinner.FinalMSG = fmt.Sprintf("%s\n", message)
	s.Spinner.Stop()
}

func (s *Spinner) Succeed(message string) {
	s.Spinner.FinalMSG = fmt.Sprintf("%s\n", message)
	s.Spinner.Stop()
}
