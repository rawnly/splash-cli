package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/google/uuid"
	"github.com/rawnly/splash-cli/cmd"
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/analytics"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/rawnly/splash-cli/unsplash/models"
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

func loadConfig() error {
	viper.SetConfigType("json")
	viper.SetConfigName("splash-cli")
	viper.AddConfigPath("$HOME/.config")
	viper.AddConfigPath("$HOME/.splash-cli")
	config.DefaultUserConfig.LoadDefaults()

	if err := viper.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return err
		}
		home, err := os.UserHomeDir()
		if err != nil {
			return err
		}
		dir := filepath.Join(home, ".config")
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return err
		}
		viper.SetConfigFile(filepath.Join(dir, "splash-cli.json"))
		return viper.SafeWriteConfig()
	}
	return nil
}

// Fetch topics in the background, but apply them on the command goroutine:
// Viper is not safe for concurrent reads and writes.
func updateTopics(api *unsplash.Api) <-chan []models.Topic {
	updates := make(chan []models.Topic, 1)
	go func() {
		if topics, err := api.GetTopics(); err == nil {
			updates <- topics
		}
	}()
	return updates
}

func main() {
	if err := run(); err != nil {
		os.Exit(1)
	}
}

func run() error {
	var analyticsClient *analytics.Analytics
	var topicUpdates <-chan []models.Topic
	defer func() {
		select {
		case topics := <-topicUpdates:
			viper.Set("topics.list", topics)
			viper.Set("topics.last_update", time.Now().Unix())
			_ = viper.WriteConfig()
		default:
		}
		if analyticsClient != nil {
			if err := analyticsClient.Close(); err != nil {
				log.Debug().Err(err).Msg("Closing analytics client")
			}
		}
		sentry.Flush(2 * time.Second)
	}()

	// Initialization runs inside the command lifecycle so configuration errors,
	// first-run consent, and setup failures receive the same status as command
	// work. Help, version, and shell completion never initialize the application.
	return cmd.Execute(context.Background(), func(command *cobra.Command) error {
		if err := setupLogs(); err != nil {
			return err
		}
		if err := loadConfig(); err != nil {
			return err
		}
		clientID, clientSecret, err := config.GetKeys()
		if err != nil {
			return err
		}
		analyticsClient = setupPosthog()
		api := unsplash.Api{
			ClientId:     clientID,
			RedirectUri:  "http://localhost:5835",
			ClientSecret: clientSecret,
			Client:       http.Client{},
		}

		accessToken := tokens.GetAccessToken()
		refreshToken := tokens.GetRefreshToken()
		ctx := command.Context()
		ctx = context.WithValue(ctx, keys.IsLogged, accessToken != "" && refreshToken != "")
		ctx = context.WithValue(ctx, keys.APIInstance, api)
		ctx = context.WithValue(ctx, keys.Analytics, analyticsClient)
		command.SetContext(ctx)
		topicUpdates = updateTopics(&api)

		// Telemetry is best-effort and must not terminate a running command.
		if err := setupSentry(); err != nil {
			log.Debug().Err(err).Msg("Sentry initialization failed")
		}

		lastCheck := viper.GetTime("photo_of_the_day.last_update")
		refreshInterval := viper.GetDuration("photo_of_the_day.refresh_interval")
		if !lastCheck.IsZero() && time.Since(lastCheck) > refreshInterval {
			viper.Set("photo_of_the_day.last_update", 0)
			viper.Set("photo_of_the_day.id", "")
			_ = viper.WriteConfig()
		}

		if !viper.GetBool("has_run_before") {
			consent, err := analyticsClient.PromptConsent(ctx)
			if err != nil {
				return err
			}
			viper.Set("has_run_before", true)
			viper.Set("user_id", uuid.NewString())
			if consent {
				_ = analyticsClient.Capture("installation", nil)
			}
			if err := viper.WriteConfig(); err != nil {
				return err
			}
		}

		downloadPath := lib.ExpandPath(viper.GetString("download_dir"))
		if _, err := os.Stat(downloadPath); os.IsNotExist(err) {
			if err := os.MkdirAll(downloadPath, 0o755); err != nil {
				return err
			}
		}

		_ = analyticsClient.Capture("app_open", nil)
		return nil
	})
}
