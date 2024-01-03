package github

import (
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib/github/models"
	"github.com/sirupsen/logrus"
)

func CurrentVersion() (*models.Version, error) {
	if config.Version == "dev" {
		return nil, nil
	}

	logrus.WithField("version", config.Version).Debug("Fetching current version")

	return models.VersionFromString(config.Version)
}

func NeedsToUpdate() (bool, *models.Version) {
	current, err := CurrentVersion()
	if err != nil {
		logrus.WithField("error", err).Error("Error while fetching current version:", err)
		return false, nil
	}

	latest, err := GetLatestVersion()
	if err != nil {
		logrus.WithField("error", err).Error("Error while fetching latest version:", err)
		return false, nil
	}

	// only while development version
	if current == nil {
		return true, latest
	}

	return latest.IsNewerThan(current), latest
}
