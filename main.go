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
	"github.com/rawnly/splash-cli/lib/analytics"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	ClientId     = "YOUR_CLIENT_ID"
	ClientSecret = "YOUR_CLIENT_SECRET"
	SentryDSN    = "YOUR_SENTRY_DSN"
	PostHogKey   = "YOUR_POSTHOG_KEY"
	Debug        string
)

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

func setupSentry() {
	if SentryDSN == "YOUR_SENTRY_DSN" {
		return
	}

	err := sentry.Init(sentry.ClientOptions{
		Dsn:              SentryDSN,
		TracesSampleRate: 1.0,
	})

	cobra.CheckErr(err)
}

func setupPosthog() *analytics.Analytics {
	return analytics.New(PostHogKey, Debug == "true")
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
	analyticsClient := setupPosthog()
	api := unsplash.Api{
		ClientId:     ClientId,
		RedirectUri:  "http://localhost:8888",
		ClientSecret: ClientSecret,
		Client:       http.Client{},
	}

	// Load settings
	accessToken := viper.GetString("auth.access_token")
	refreshToken := viper.GetString("auth.refresh_token")

	ctx = context.WithValue(ctx, keys.IsLogged, accessToken != "" && refreshToken != "")
	ctx = context.WithValue(ctx, keys.ApiInstance, api)
	ctx = context.WithValue(ctx, keys.Analytics, analyticsClient)

	if Debug == "true" {
		logrus.SetLevel(logrus.DebugLevel)
	} else {
		logrus.SetLevel(logrus.WarnLevel)

		go setupSentry()
		defer sentry.Flush(2 * time.Second)
	}

	go updateTopics(&api)

	defer func() {
		logrus.Debug("Closing analytics client")
		if err := analyticsClient.Close(); err != nil {
			logrus.Error("Error closing analytics client:", err)
		}
	}()

	logrus.Debug("Checking if first run")

	if viper.GetBool("has_run_before") == false {
		logrus.Debug("First run detected")

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
		logrus.Debug("Creating download path")

		err := os.MkdirAll(downloadPath, 0755)
		cobra.CheckErr(err)
	}

	analyticsClient.Capture("app_open", nil)

	cmd.Execute(ctx)
}
