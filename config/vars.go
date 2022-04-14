package config

import "fmt"

var Version string = "dev"
var Commit string = "unknown"

func GetVersion() string {
	if len(Commit) >= 7 {
		Commit = Commit[:7]
	}

	return fmt.Sprintf("%s (%s)", Version, Commit)
}
