package main

import (
	"github.com/rawnly/splash-cli/commands"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/sirupsen/logrus"
	"net/http"
)

var ClientId = "YOUR_CLIENT_ID"
var Debug string

func main() {
	api := unsplash.Api{
		ClientId: ClientId,
		Client:   http.Client{},
	}

	cmd := commands.GetRootCommand(&api)

	logrus.SetOutput(cmd.OutOrStdout())

	if Debug != "" {
		logrus.SetLevel(logrus.DebugLevel)
	} else {
		logrus.SetLevel(logrus.InfoLevel)
	}

	_ = cmd.Execute()
}
