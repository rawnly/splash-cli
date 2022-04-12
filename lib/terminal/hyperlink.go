package terminal

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

const (
	ESC string = "\u001B["
	OSC string = "\u001B]"
	BEL string = "\u0007"
	SEP string = ";"
)

func hasFlag(flag string) bool {
	for _, s := range os.Args {
		re, _ := regexp.Compile(`^-{1,2}`)
		s = re.ReplaceAllString(s, "")

		if s == flag {
			return true
		}
	}

	return false
}

func hasKey(key string, m map[string]string) bool {
	_, ok := m[key]
	return ok
}

func parseVersion(version string) (int, int, int) {
	if strings.Count(version, ".") == 0 {
		regex := `(\d{1,2})(\d{2})`
		re := regexp.MustCompile(regex)
		matches := re.FindStringSubmatch(version)

		if len(matches) == 3 {
			minor, _ := strconv.Atoi(matches[1])
			patch, _ := strconv.Atoi(matches[2])

			return 0, minor, patch
		}

		return 0, 0, 0
	}

	parts := strings.Split(version, ".")

	major, _ := strconv.Atoi(parts[0])
	minor, _ := strconv.Atoi(parts[1])
	patch, _ := strconv.Atoi(parts[2])

	return major, minor, patch
}

// SupportsHyperLinks Code inspired by https://github.com/jamestalmage/supports-hyperlinks/
func SupportsHyperLinks(env map[string]string) bool {
	if hasKey("FORCE_HYPERLINK", env) {
		intValue, err := strconv.Atoi(env["FORCE_HYPERLINK"])

		if err != nil {
			return false
		}

		return !(len(env["FORCE_HYPERLINK"]) > 0 && intValue == 0)
	}

	if hasFlag("no-hyperlink") || hasFlag("no-hyperlinks") {
		return false
	}

	if hasFlag("hyperlink=true") || hasFlag("hyperlink=always") {
		return true
	}

	if hasKey("NETLIFY", env) {
		return true
	}

	if hasKey("CI", env) || hasKey("TEAMCITY_VERSION", env) {
		return false
	}

	if hasKey("VTE_VERSION", env) {
		if env["VTE_VERSION"] == "0.50.0" {
			return false
		}

		major, minor, _ := parseVersion(env["VTE_VERSION"])

		return major > 0 || minor >= 50
	}

	switch env["TERM_PROGRAM"] {
	case "iTerm.app":
		major, minor, _ := parseVersion(env["TERM_PROGRAM_VERSION"])
		return (major == 3 && minor >= 1) || major > 3
	default:
		return false
	}
}

func HyperLink(text string, url string) {
	env := GetEnv()
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

	if SupportsHyperLinks(env) {
		fmt.Println(strings.Join(seq, ""))
		return
	}

	fmt.Println(fmt.Sprintf("%s (%s)", text, url))
}
