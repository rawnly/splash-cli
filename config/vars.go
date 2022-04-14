package config

import "fmt"

var Version string = "dev"
var Commit string

func GetVersion() string {
	return fmt.Sprintf("%s (%s)", Version, Commit[:7])
}
