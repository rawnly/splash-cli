package terminal

import (
	"fmt"
	"os"
	"strings"

	"github.com/briandowns/spinner"
)

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

func GetEnv() map[string]string {
	env := make(map[string]string)

	for _, s := range os.Environ() {
		pair := strings.Split(s, "=")
		env[pair[0]] = pair[1]
	}

	return env
}

func Clear() {
	// cmd := exec.Command("clear")
	// cmd.Stdout = os.Stdout
	// _ = cmd.Run()
}
