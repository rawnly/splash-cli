package main

import (
	"os"

	"github.com/getsentry/sentry-go"
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib/analytics"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// Setup the logs
func setupLogs() {
	// You could set this to any `io.Writer` such as a file
	file, err := os.OpenFile("splash-cli.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		logrus.SetOutput(file)
	} else {
		logrus.Warn("Failed to log to file, using default stderr")
	}

	if config.GetFormatterType() == config.LOG_FORMAT_JSON {
		logrus.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat:  "2006-01-02 15:04:05",
			DisableTimestamp: true,
		})
	} else {
		logrus.SetFormatter(&logrus.TextFormatter{
			DisableColors:    false,
			FullTimestamp:    true,
			DisableTimestamp: true,
			TimestampFormat:  "2006-01-02 15:04:05",
		})
	}

	if config.IsDebug() {
		if os.Getenv("LOG_LEVEL") == "trace" {
			logrus.SetLevel(logrus.TraceLevel)
		} else {
			logrus.SetLevel(logrus.DebugLevel)
		}

		logrus.SetReportCaller(true)
	} else {
		logrus.SetLevel(logrus.WarnLevel)
	}
}

// Setup sentry if not in DEBUG mode
func setupSentry() {
	if !config.IsSentryEnabled() {
		logrus.WithFields(logrus.Fields{
			"dsn":   config.SentryDSN,
			"debug": config.IsDebug(),
		}).Trace("Sentry disabled")
		return
	}

	err := sentry.Init(sentry.ClientOptions{
		Dsn:              config.SentryDSN,
		TracesSampleRate: 1.0,
		Environment:      config.GetEnvironment(),
		Debug:            config.IsDebug(),
	})

	cobra.CheckErr(err)
}

// Setup posthog
func setupPosthog() *analytics.Analytics {
	return analytics.New(config.PostHogKey)
}
