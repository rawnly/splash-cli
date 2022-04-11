package unsplash

import (
	"encoding/json"
	"fmt"
	"github.com/rawnly/splash-cli/unsplash/models"
	"io/ioutil"
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

func (a Api) TrackDownload(photoId string) error {
	if _, err := a.get(fmt.Sprintf("/photos/%s/download", photoId), nil); err != nil {
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

func (a Api) GetPhotoOfTheDay() (*models.Photo, error) {
	var response models.PhotoOfTheDay

	r, err := a.Client.Get("https://lambda.splash-cli.app/api")
	if err != nil {
		return nil, err
	}

	data, err := ioutil.ReadAll(r.Body)
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
