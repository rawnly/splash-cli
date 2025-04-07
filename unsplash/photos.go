package unsplash

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/rawnly/splash-cli/unsplash/models"
)

func (a Api) GetPhoto(id string) (*models.Photo, error) {
	var photo models.Photo

	pathname := fmt.Sprintf("/photos/%s", id)
	data, err := a.get(pathname, nil)
	if err != nil {
		return nil, err
	}

	if err = json.Unmarshal(data, &photo); err != nil {
		return nil, err
	}

	return &photo, nil
}

func (a Api) GetRandomPhoto(params models.RandomPhotoParams) ([]models.Photo, error) {
	var photo []models.Photo

	data, err := a.get("/photos/random", params)
	if err != nil {
		return nil, err
	}

	if err = json.Unmarshal(data, &photo); err != nil {
		return nil, err
	}

	return photo, nil
}

func (a Api) TrackDownload(photoID string) error {
	if _, err := a.get(fmt.Sprintf("/photos/%s/download", photoID), nil); err != nil {
		return err
	}

	return nil
}

func (a Api) Like(id string) error {
	if _, err := a.post(fmt.Sprintf("/photos/%s/like", id), nil, nil); err != nil {
		return err
	}

	return nil
}

func (a Api) Unlike(id string) error {
	if _, err := a.delete(fmt.Sprintf("/photos/%s/like", id), nil); err != nil {
		return err
	}

	return nil
}

func (a Api) GetPhotoOfTheDay() (*models.Photo, error) {
	var response models.PhotoOfTheDay

	r, err := a.Client.Get("https://splash-cli-api.untitled.dev/api/wallpapers")
	if err != nil {
		return nil, err
	}

	data, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}

	if err = json.Unmarshal(data, &response); err != nil {
		return nil, err
	}

	photo, err := a.GetPhoto(response.Id)
	if err != nil {
		return nil, err
	}

	return photo, nil
}
