package main

import (
	"context"
	"github.com/rawnly/splash-cli/cmd"
	"github.com/rawnly/splash-cli/config"
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

func runChecks() {
	now := time.Now().Unix()
	timestamp := viper.GetInt64("photo_of_the_day.last_update")
	refreshInterval := viper.GetDuration("photo_of_the_day.refresh_interval")

	if timestamp == 0 {
		logrus.Debug("No timestamp found")
		return
	}

	if (now - timestamp) > int64(refreshInterval.Seconds()) {
		logrus.Debug("Clearing photo of the day")

		viper.Set("photo_of_the_day.last_update", 0)
		viper.Set("photo_of_the_day.id", "")

		err := viper.WriteConfig()
		cobra.CheckErr(err)
	}
}

func updateTopics(api *unsplash.Api) {
	topics, err := api.GetTopics()

	if err != nil {
		return
	}

	viper.Set("topics.list", topics)
	viper.Set("topics.last_update", time.Now().Unix())
}

func init() {
	viper.SetConfigType("json")
	viper.SetConfigName("splash-cli")
	viper.AddConfigPath("$HOME/.config")
	viper.AddConfigPath("$HOME/.splash-cli")

	config.DefaultUserConfig.LoadDefaults()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			logrus.Debug("No settings file found")

			// Create file if not exists
			if err := viper.SafeWriteConfig(); err != nil {
				cobra.CheckErr(err)
			}
		} else {
			logrus.Fatal("Error reading settings file:", err)
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

	// Load settings
	accessToken := viper.GetString("auth.access_token")
	refreshToken := viper.GetString("auth.refresh_token")

	ctx = context.WithValue(ctx, "isLoggedIn", accessToken != "" && refreshToken != "")
	ctx = context.WithValue(ctx, "api", api)

	if Debug == "true" {
		logrus.SetLevel(logrus.DebugLevel)
	} else {
		logrus.SetLevel(logrus.WarnLevel)
	}

	go updateTopics(&api)

	cmd.Execute(ctx)
}
