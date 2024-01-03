package github

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/rawnly/splash-cli/lib/github/models"
	"github.com/sirupsen/logrus"
)

type ReleaseResponse struct {
	TagName string `json:"tag_name"`
}

func GetLatestVersion() (*models.Version, error) {
	url := "https://api.github.com/repos/rawnly/splash-cli/releases/latest"

	client := http.Client{}

	response, err := client.Get(url)

	logrus.Debug("Fetching latest release from GitHub")

	if err != nil {
		logrus.WithField("error", err).Error("Error while fetching latest release:", err)
		return nil, err
	}

	if response.StatusCode != 200 {
		logrus.WithField("status", response.StatusCode).Error("Error while fetching latest release")
		return nil, fmt.Errorf("Something went wrong while fetching the latest release")
	}

	data, err := io.ReadAll(response.Body)
	if err != nil {
		logrus.WithField("error", err).Error("Error while reading response body:", err)
		return nil, err
	}

	var releaseRes ReleaseResponse
	if err := json.Unmarshal(data, &releaseRes); err != nil {
		logrus.WithField("error", err).Error("Error while parsing response body:", err)
		return nil, err
	}

	logrus.WithField("version", releaseRes.TagName).Debug("Latest release fetched")

	return models.VersionFromString(releaseRes.TagName)
}
