package main

import (
	"context"
	"github.com/rawnly/splash-cli/cmd"
	"github.com/rawnly/splash-cli/lib/storage"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/sirupsen/logrus"
	"net/http"
	"os"
	"time"
)

var ClientId = "YOUR_CLIENT_ID"
var ClientSecret = "YOUR_CLIENT_SECRET"
var Debug string
var Version string = "4.0.0--alpha"

func runChecks(ctx context.Context) {
	s := ctx.Value("storage").(storage.Storage)
	logrus.Debug("Checking photo of the day ctx")

	timestamp := s.Data.PhotoOfTheDayDate
	now := time.Now().Unix()

	if timestamp == 0 {
		logrus.Debug("No timestamp found")
		return
	}

	if (now - timestamp) > int64((time.Hour * 12).Seconds()) {
		logrus.Debug("Clearing photo of the day")

		s.Data.PhotoOfTheDayDate = 0
		s.Data.PhotoOfTheDayUrl = ""
		s.Data.PhotoOfTheDayId = ""

		if err := s.Save(); err != nil {
			logrus.Error(err)
		}
	}
}

func main() {
	ctx := context.Background()

	s := storage.Storage{
		Data: storage.StorageData{
			PhotoOfTheDayDate: 0,
			PhotoOfTheDayId:   "",
			PhotoOfTheDayUrl:  "",
		},
	}

	if err := s.Init(); err != nil {
		logrus.Fatal(err)
		os.Exit(1)
	}

	if err := s.Load(); err != nil {
		logrus.Fatal(err)
		os.Exit(1)
	}

	// load storage into context
	ctx = context.WithValue(ctx, "storage", s)
	ctx = context.WithValue(ctx, "isLoggedIn", s.Data.AccessToken != "" && s.Data.RefreshToken != "")

	go runChecks(ctx)

	api := unsplash.Api{
		ClientId:     ClientId,
		RedirectUri:  "http://localhost:8888",
		ClientSecret: ClientSecret,
		Client:       http.Client{},
		Context:      ctx,
	}

	rootCmd := cmd.GetRootCommand(&api, ctx, Version)
	rootCmd.AddCommand(cmd.GetAuthCommand(&api, ctx))

	logrus.SetOutput(rootCmd.OutOrStdout())

	if Debug != "" {
		logrus.SetLevel(logrus.DebugLevel)
	} else {
		logrus.SetLevel(logrus.InfoLevel)
	}

	if err := rootCmd.Execute(); err != nil {
		logrus.Fatal(err)
		os.Exit(1)
	}
}
