package github

import (
	"strings"

	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib/github/models"
	"github.com/sirupsen/logrus"
	"golang.org/x/mod/semver"
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

	latestVersion, latest, err := GetLatestVersion()
	if err != nil {
		logrus.WithField("error", err).Error("Error while fetching latest version:", err)
		return false, nil
	}

	// only while development version
	if current == nil {
		return true, latestVersion
	}

	return isOutdated(config.Version, latest), latestVersion
}

func isOutdated(current, latest string) bool {
	if !strings.HasPrefix(current, "v") {
		current = "v" + current
	}

	if !strings.HasPrefix(latest, "v") {
		latest = "v" + latest
	}

	if strings.Contains(semver.Prerelease(current), "dev") {
		return false
	}

	return semver.Compare(current, latest) < 0
}
