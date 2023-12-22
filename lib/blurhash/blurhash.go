package blurhash

import (
	"image/png"
	"os"

	"github.com/bbrks/go-blurhash"
	"github.com/rawnly/go-wallpaper"
	"github.com/rawnly/splash-cli/unsplash/models"
	"github.com/sirupsen/logrus"
)

func Prepare(photo *models.Photo) error {
	w := 1920
	h := 1080
	punch := 1

	img, err := blurhash.Decode(photo.Blurhash, w, h, punch)
	if err != nil {
		return err
	}

	file, err := os.CreateTemp("", "splash-cli-hash-*.png")
	if err != nil {
		return err
	}

	logrus.Debug("Saving image to ", file.Name())

	if err := png.Encode(file, img); err != nil {
		defer os.Remove(file.Name())
		return err
	}

	defer file.Close()

	if err := wallpaper.SetFromFile(file.Name()); err != nil {
		defer os.Remove(file.Name())
		logrus.Debug("Error while setting hash wallpaper: ", err)
		return err
	}

	return nil
}
