package unsplash

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/unsplash/models"
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

type Api struct {
	ClientId     string
	ClientSecret string
	RedirectUri  string
	Client       http.Client
}

func (a Api) buildUrl(pathname string, data map[string]string) (string, error) {
	return lib.Template{
		Data:     data,
		Template: pathname,
	}.String()
}

func (a Api) AuthenticationUrl(scopes ...string) string {
	baseUrl := "https://unsplash.com/oauth/authorize"
	scope := strings.Join(scopes, "+")

	return fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&scope=%s&response_type=code", baseUrl, a.ClientId, url.PathEscape(a.RedirectUri), scope)
}

type AuthRes struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func (a Api) Authenticate(code string) (*AuthRes, error) {
	baseUrl := "https://unsplash.com/oauth/token"
	payload := map[string]string{
		"client_id":     a.ClientId,
		"client_secret": a.ClientSecret,
		"redirect_uri":  a.RedirectUri,
		"code":          code,
		"grant_type":    "authorization_code",
	}

	data, err := json.Marshal(payload)

	if err != nil {
		return nil, err
	}

	response, err := http.Post(baseUrl, "application/json", bytes.NewBuffer(data))

	if err != nil {
		return nil, err
	}

	var authRes AuthRes
	data, err = ioutil.ReadAll(response.Body)

	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &authRes); err != nil {
		return nil, err
	}

	return &authRes, nil
}

func (a Api) get(pathname string, params interface{}) ([]byte, error) {
	baseUrl := fmt.Sprintf("https://api.unsplash.com%s", pathname)

	if params != nil {
		baseUrl += fmt.Sprintf("?%s", Stringify(params))
	}

	logrus.Debug("GET", baseUrl)

	req, err := http.NewRequest("GET", baseUrl, nil)

	if err != nil {
		return nil, err
	}

	req.Header.Add("Authorization", fmt.Sprintf("Client-ID %s", a.ClientId))
	response, err := a.Client.Do(req)

	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	if response.StatusCode != 200 {
		return nil, errors.New("Error: " + response.Status)
	}

	return ioutil.ReadAll(response.Body)
}

func (a Api) GetPhoto(id string) (*models.Photo, error) {
	var photo models.Photo

	url := fmt.Sprintf("/photos/%s", id)
	data, err := a.get(url, nil)

	if err != nil {
		return nil, err
	}

	if err = json.Unmarshal(data, &photo); err != nil {
		return nil, err
	}

	return &photo, nil
}

func (a Api) GetRandomPhoto(params RandomPhotoParams) ([]models.Photo, error) {
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
