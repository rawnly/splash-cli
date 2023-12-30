package config

import (
	"fmt"
	"os"
)

const (
	DEFAULT_SENTRY_DSN    string = "YOUR_SENTRY_DSN"
	DEFAULT_CLIENT_ID     string = "UNSPLASH_CLIENT_ID"
	DEFAULT_CLIENT_SECRET string = "UNSPLASH_CLIENT_SECRET"
	DEFAULT_POSTHOG_KEY   string = "YOUR_POSTHOG_KEY"
)

var (
	ClientId     = DEFAULT_CLIENT_ID
	ClientSecret = DEFAULT_CLIENT_SECRET
	SentryDSN    = DEFAULT_SENTRY_DSN
	PostHogKey   = DEFAULT_POSTHOG_KEY
	Version      = "dev"
	Commit       = "none"
	Debug        = "false"
)

func GetVersion() string {
	if len(Commit) > 7 {
		Commit = Commit[:7]
	}

	if len(Commit) == 0 {
		return fmt.Sprintf("%s\n", Version)
	}

	return fmt.Sprintf("%s (%s)\n", Version, Commit)
}

func IsDebug() bool {
	return Debug == "true"
}

func IsSentryEnabled() bool {
	return SentryDSN != DEFAULT_SENTRY_DSN
}

func IsPostHogEnabled() bool {
	return PostHogKey != DEFAULT_POSTHOG_KEY
}

func GetKeys() (string, string) {
	if ClientId == DEFAULT_CLIENT_ID {
		ClientId = os.Getenv("UNSPLASH_CLIENT_ID")
	}

	if ClientSecret == DEFAULT_CLIENT_SECRET {
		ClientSecret = os.Getenv("UNSPLASH_CLIENT_SECRET")
	}

	return ClientId, ClientSecret
}
