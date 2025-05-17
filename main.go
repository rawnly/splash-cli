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
	"github.com/rawnly/splash-cli/unsplash/tokens"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

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
			log.Debug().Msg("No settings file found")

			// Create file if not exists
			if err = viper.SafeWriteConfig(); err != nil {
				cobra.CheckErr(err)
			}
		} else {
			log.Fatal().Msgf("Error reading settings file: %s", err)
		}
	}

	checkForUpdates()

	go func() {
		now := time.Now().Unix()
		timestamp := viper.GetInt64("photo_of_the_day.last_update")
		refreshInterval := viper.GetDuration("photo_of_the_day.refresh_interval")

		if timestamp == 0 {
			log.Debug().Msg("No timestamp found")
			return
		}

		if (now - timestamp) > int64(refreshInterval.Seconds()) {
			log.Debug().Msg("Clearing photo of the day")

			viper.Set("photo_of_the_day.last_update", 0)
			viper.Set("photo_of_the_day.id", "")

			err := viper.WriteConfig()
			cobra.CheckErr(err)
		}
	}()
}

func checkForUpdates() {
	log.Debug().Msg("Checking for updates")

	lastCheck := viper.GetInt64("update.last_update")

	if time.Now().Unix()-lastCheck < 60*60*24 {
		log.Debug().
			Int64("last_check", lastCheck).
			Int64("now", time.Now().Unix()).
			Str("version", viper.GetString("update.latest_tag")).
			Str("current_version", config.GetVersion()).
			Msg("Update check performed in the last 24 hours. Aborting check...")

		return
	}

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
	clientID, clientSecret := config.GetKeys()

	ctx := context.Background()
	analyticsClient := setupPosthog()
	api := unsplash.Api{
		ClientId:     clientID,
		RedirectUri:  "http://localhost:5835",
		ClientSecret: clientSecret,
		Client:       http.Client{},
	}

	// Load settings
	accessToken := tokens.GetAccessToken()
	refreshToken := tokens.GetRefreshToken()

	ctx = context.WithValue(ctx, keys.IsLogged, accessToken != "" && refreshToken != "")
	ctx = context.WithValue(ctx, keys.APIInstance, api)
	ctx = context.WithValue(ctx, keys.Analytics, analyticsClient)

	go setupSentry()
	defer sentry.Flush(2 * time.Second)

	go updateTopics(&api)

	defer func() {
		log.Trace().Msg("Closing analytics client")

		if err := analyticsClient.Close(); err != nil {
			log.Error().Msgf("Error closing analytics client: %s", err)
		}
	}()

	log.Trace().Msg("Checking if first run")
	if !viper.GetBool("has_run_before") {
		log.Trace().Msg("First run detected")

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
		log.Debug().Str("download-path", downloadPath).Msg("Download path does not exist")

		err := os.MkdirAll(downloadPath, 0o755)
		cobra.CheckErr(err)
	}

	analyticsClient.Capture("app_open", nil)

	cmd.Execute(ctx)
}
