package config

import (
	"fmt"
	"os"

	"github.com/rawnly/splash-cli/lib/env"
	"github.com/sirupsen/logrus"
)

const (
	DefaultSentryDSN    string = "YOUR_SENTRY_DSN"
	DefaultClientID     string = "UNSPLASH_CLIENT_ID"
	DefaultClientSecret string = "UNSPLASH_CLIENT_SECRET"
	DefaultPosthogKey   string = "YOUR_POSTHOG_KEY"
)

var (
	ClientID     = DefaultClientID
	ClientSecret = DefaultClientSecret
	SentryDSN    = DefaultSentryDSN
	PostHogKey   = DefaultPosthogKey
	Version      = "dev"
	Commit       = "none"
	Date         = "unknown"
	Debug        bool
	SentryDebug  string
)

const (
	LogFormatJSON string = "json"
	LogFormatText string = "text"
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

	if format == LogFormatJSON {
		return LogFormatJSON
	}

	return LogFormatText
}

func IsDebug() bool {
	return env.Bool("DEBUG", false)
}

func GetEnvironment() string {
	if IsDebug() {
		return "dev"
	}

	return "prod"
}

func IsSentryEnabled() bool {
	return SentryDSN != DefaultSentryDSN && SentryDSN != ""
}

func IsPostHogEnabled() bool {
	return PostHogKey != DefaultPosthogKey
}

func GetKeys() (string, string) {
	if ClientID == DefaultClientID {
		ClientID = env.String("UNSPLASH_CLIENT_ID")
	}

	if ClientID == "" {
		logrus.Fatal("`UNSPLASH_CLIENT_ID` not found", DefaultClientID)
	}

	if ClientSecret == DefaultClientSecret {
		ClientSecret = env.String("UNSPLASH_CLIENT_SECRET", DefaultClientSecret)
	}

	if ClientSecret == "" {
		logrus.Fatal("`UNSPLASH_CLIENT_SECRET` not found")
	}

	return ClientID, ClientSecret
}

var SentryEventDetails = map[string]string{
	"version":  Version,
	"commit":   Commit,
	"date":     Date,
	"username": os.Getenv("USER"),
}
