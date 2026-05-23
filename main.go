package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/google/uuid"
	"github.com/rawnly/splash-cli/cmd"
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib"
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
}

func main() {
	coreLogger := log.With().Str("service", "core").Logger()
	anaylticsLogger := log.With().Str("service", "analytics").Logger() //.With().Str("service", "analytics").Logger

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

	// update photo of the day cache
	go func() {
		log := log.With().Str("service", "photo-of-the-day").Logger()

		lastCheck := viper.GetTime("photo_of_the_day.last_update")
		refreshInterval := viper.GetDuration("photo_of_the_day.refresh_interval")

		if lastCheck.IsZero() {
			log.Debug().Msg("no cached photo of the day timestamp found")
			return
		}

		if time.Since(lastCheck) > refreshInterval {
			log.Debug().Msg("cache expired")

			viper.Set("photo_of_the_day.last_update", 0)
			viper.Set("photo_of_the_day.id", "")

			// fail silently
			_ = viper.WriteConfig()

			return
		}
	}()

	defer func() {
		anaylticsLogger.Trace().Msg("closing client")

		if err := analyticsClient.Close(); err != nil {
			anaylticsLogger.Error().Msgf("closing analytics client: %s", err)
		}
	}()

	coreLogger.Trace().Str("service", "core").Msg("checking if first run")
	if !viper.GetBool("has_run_before") {
		coreLogger.Trace().Msg("first run detected")

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
		coreLogger.Debug().Str("download-path", downloadPath).Msg("Download path does not exist")

		err := os.MkdirAll(downloadPath, 0o755)
		cobra.CheckErr(err)
	}

	analyticsClient.Capture("app_open", nil)

	cmd.Execute(ctx)
}
