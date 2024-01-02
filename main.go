package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/AlecAivazis/survey/v2"
	"github.com/cli/browser"
	"github.com/getsentry/sentry-go"
	"github.com/google/uuid"
	"github.com/rawnly/splash-cli/cmd"
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/github"
	"github.com/rawnly/splash-cli/lib/github/models"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func printLdFlags() {
	fmt.Printf("Version: %s\n", version)
	fmt.Printf("Commit: %s\n", commit)
	fmt.Printf("Date: %s\n", date)
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
	setupLogs()

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

	checkForUpdates()

	go func() {
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
	}()
}

func checkForUpdates() {
	logrus.Debug("Checking for updates")
	updateNeeded, version := github.NeedsToUpdate()

	viper.Set("update.last_update", time.Now().Unix())
	viper.Set("update.latest_tag", version)
	_ = viper.WriteConfig()

	if updateNeeded {
		prompt := &survey.Confirm{
			Default: true,
			Message: fmt.Sprintf("A new version (%s) is available, would you like to update?", models.VersionToString(version)),
		}

		confirm := true
		if err := survey.AskOne(prompt, &confirm); err != nil {
			return
		}

		if !confirm {
			return
		}

		_ = browser.OpenURL("https://github.com/rawnly/splash-cli/releases/latest")
	}
}

func main() {
	ClientId, ClientSecret := config.GetKeys()

	ctx := context.Background()
	analyticsClient := setupPosthog()
	api := unsplash.Api{
		ClientId:     ClientId,
		RedirectUri:  "http://localhost:5835",
		ClientSecret: ClientSecret,
		Client:       http.Client{},
	}

	// Load settings
	accessToken := viper.GetString("auth.access_token")
	refreshToken := viper.GetString("auth.refresh_token")

	ctx = context.WithValue(ctx, keys.IsLogged, accessToken != "" && refreshToken != "")
	ctx = context.WithValue(ctx, keys.ApiInstance, api)
	ctx = context.WithValue(ctx, keys.Analytics, analyticsClient)

	go setupSentry()
	defer sentry.Flush(2 * time.Second)

	go updateTopics(&api)

	defer func() {
		logrus.Trace("Closing analytics client")

		if err := analyticsClient.Close(); err != nil {
			logrus.Error("Error closing analytics client:", err)
		}
	}()

	logrus.Trace("Checking if first run")
	if viper.GetBool("has_run_before") == false {
		logrus.Trace("First run detected")

		viper.Set("has_run_before", true)
		viper.Set("user_id", uuid.NewString())

		if analyticsClient.PromptConsent() {
			analyticsClient.Capture("installation", nil)
		}

		err := viper.WriteConfig()
		cobra.CheckErr(err)
	}

	// check for download path and create if not exists
	downloadPath := viper.GetString("download_dir")
	downloadPath = lib.ExpandPath(downloadPath)

	if _, err := os.Stat(downloadPath); os.IsNotExist(err) {
		logrus.WithField("download-path", downloadPath).Debug("Creating download path")

		err := os.MkdirAll(downloadPath, 0755)
		cobra.CheckErr(err)
	}

	analyticsClient.Capture("app_open", nil)

	cmd.Execute(ctx)
}
