package github

import (
	"strings"

	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib/github/models"
	"github.com/sirupsen/logrus"
	"golang.org/x/mod/semver"
)

var getLatestVersion = GetLatestVersion

func CurrentVersion() (*models.Version, error) {
	if config.Version == "" || strings.Contains(config.Version, "dev") {
		return nil, nil
	}

	logrus.WithField("version", config.Version).Debug("Fetching current version")

	return models.VersionFromString(config.Version)
}

func NeedsToUpdate() (bool, *models.Version, error) {
	current, err := CurrentVersion()
	if err != nil {
		logrus.WithField("error", err).Error("Error while fetching current version:", err)
		return false, nil, err
	}

	if current == nil {
		return false, nil, nil
	}

	latestVersion, latest, err := getLatestVersion()
	if err != nil {
		logrus.WithField("error", err).Error("Error while fetching latest version:", err)
		return false, nil, err
	}

	return isOutdated(config.Version, latest), latestVersion, nil
}

func isOutdated(current, latest string) bool {
	current = strings.TrimSpace(current)
	latest = strings.TrimSpace(latest)

	if !strings.HasPrefix(current, "v") {
		current = "v" + current
	}

	if !strings.HasPrefix(latest, "v") {
		latest = "v" + latest
	}

	if strings.Contains(semver.Prerelease(current), "dev") {
		return false
	}

	return semver.IsValid(current) && semver.IsValid(latest) && semver.Compare(current, latest) < 0
}
