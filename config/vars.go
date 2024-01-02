package config

import (
	"fmt"
	"os"

	"github.com/sirupsen/logrus"
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
	Date         = "unknown"
	Debug        string
)

const (
	LOG_FORMAT_JSON string = "json"
	LOG_FORMAT_TEXT string = "text"
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

func GetFormatterType() string {
	format := os.Getenv("LOG_FORMAT")

	if format == LOG_FORMAT_JSON {
		return LOG_FORMAT_JSON
	}

	return LOG_FORMAT_TEXT
}

func IsDebug() bool {
	if Debug == "" {
		Debug = os.Getenv("DEBUG")
	}

	return Debug == "true"
}

func GetEnvironment() string {
	if IsDebug() {
		return "dev"
	}

	return "prod"
}

func IsSentryEnabled() bool {
	return SentryDSN != DEFAULT_SENTRY_DSN && SentryDSN != ""
}

func IsPostHogEnabled() bool {
	return PostHogKey != DEFAULT_POSTHOG_KEY
}

func GetKeys() (string, string) {
	if ClientId == DEFAULT_CLIENT_ID {
		ClientId = os.Getenv("UNSPLASH_CLIENT_ID")
	}

	if ClientId == "" {
		logrus.Fatal("`UNSPLASH_CLIENT_ID` not found")
	}

	if ClientSecret == DEFAULT_CLIENT_SECRET {
		ClientSecret = os.Getenv("UNSPLASH_CLIENT_SECRET")
	}

	if ClientSecret == "" {
		logrus.Fatal("`UNSPLASH_CLIENT_SECRET` not found")
	}

	return ClientId, ClientSecret
}

var SentryEventDetails = map[string]string{
	"version":  Version,
	"commit":   Commit,
	"date":     Date,
	"username": os.Getenv("USER"),
}
