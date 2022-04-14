package config

import "fmt"

var (
	Version = "dev"
	Commit  = "none"
)

func GetVersion() string {
	if len(Commit) > 7 {
		Commit = Commit[:7]
	}

	return fmt.Sprintf("%s (%s)\n", Version, Commit)
}
