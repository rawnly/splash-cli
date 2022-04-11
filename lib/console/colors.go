package console

import "github.com/mgutz/ansi"

func Yellow(text string) string {
	return ansi.ColorCode("yellow+b") + text + ansi.ColorCode("reset")
}

func Blue(text string) string {
	return ansi.ColorCode("blue+b") + text + ansi.ColorCode("reset")
}
