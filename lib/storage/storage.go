package storage

import (
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/sirupsen/logrus"
)

type StorageData struct {
	PhotoOfTheDayDate int64  `json:"photo_of_the_day__date"`
	PhotoOfTheDayId   string `json:"photo_of_the_day__id"`
	PhotoOfTheDayUrl  string `json:"photo_of_the_day__url"`

	unsplash.AuthRes
}

type Storage struct {
	Data StorageData `json:"data"`
}

func (s *Storage) Load() error {
	location, err := lib.HomeFile(".config/splash-cli.config.json")

	if err != nil {
		return err
	}

	logrus.Debug("Loading from disk")
	if err := lib.ReadJson(location, &s.Data); err != nil {
		return err
	}

	return nil
}

func (s Storage) Save() error {
	location, err := lib.HomeFile(".config/splash-cli.config.json")

	if err != nil {
		return err
	}

	logrus.Debug("Writing to disk")
	if err := lib.WriteJson(location, s.Data); err != nil {
		return err
	}

	return nil
}

func (s Storage) Init() error {
	location, err := lib.HomeFile(".config/splash-cli.config.json")

	if err != nil {
		return err
	}

	if lib.FileExists(location) {
		logrus.Debug("config file exists")
		return s.Load()
	}

	logrus.Debug("config file not found exists")
	return s.Save()
}
