package main

import (
	"context"
	"github.com/rawnly/splash-cli/cmd"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"net/http"
	"time"
)

var ClientId = "YOUR_CLIENT_ID"
var ClientSecret = "YOUR_CLIENT_SECRET"
var Debug string
var Version string = "4.0.0--alpha"

func runChecks() {
	timestamp := viper.GetInt64("photo-of-the-day.last-update")
	now := time.Now().Unix()

	if timestamp == 0 {
		logrus.Debug("No timestamp found")
		return
	}

	if (now - timestamp) > int64((time.Hour * 6).Seconds()) {
		logrus.Debug("Clearing photo of the day")

		viper.Set("photo-of-the-day.last-update", 0)
		viper.Set("photo-of-the-day.url", "")
		viper.Set("photo-of-the-day.id", "")

		err := viper.WriteConfig()
		cobra.CheckErr(err)
	}
}

func init() {
	viper.SetConfigType("json")
	viper.SetConfigName("splash-cli")
	viper.AddConfigPath("$HOME/.config")
	viper.AddConfigPath("$HOME/.splash-cli")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			logrus.Debug("No config file found")

			// Create file if not exists
			if err := viper.SafeWriteConfig(); err != nil {
				cobra.CheckErr(err)
			}
		} else {
			logrus.Fatal("Error reading config file:", err)
		}
	}

	logrus.Debug("Config loaded")
	logrus.Debugf("Using %s", viper.ConfigFileUsed())

	go runChecks()
}

func main() {
	ctx := context.Background()
	api := unsplash.Api{
		ClientId:     ClientId,
		RedirectUri:  "http://localhost:8888",
		ClientSecret: ClientSecret,
		Client:       http.Client{},
	}

	// Load config
	accessToken := viper.GetString("access-token")
	refreshToken := viper.GetString("refresh-token")

	ctx = context.WithValue(ctx, "isLoggedIn", accessToken != "" && refreshToken != "")
	ctx = context.WithValue(ctx, "api", api)

	if Debug == "true" {
		logrus.SetLevel(logrus.DebugLevel)
	} else {
		logrus.SetLevel(logrus.WarnLevel)
	}

	cmd.Execute(ctx)
}
