package unsplash

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/rawnly/splash-cli/unsplash/models"
	"github.com/sirupsen/logrus"
)

func (a Api) BuildAuthenticationUrl(scopes ...string) string {
	baseUrl := "https://unsplash.com/oauth/authorize"
	scope := strings.Join(scopes, "+")

	return fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&scope=%s&response_type=code", baseUrl, a.ClientId, url.PathEscape(a.RedirectUri), scope)
}

type ErrorRes struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

func (a Api) Authenticate(code string) (*models.AuthRes, error) {
	url := "https://unsplash.com/oauth/token"
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

	response, err := http.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	data, err = io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	if response.StatusCode != 200 {
		var errorRes ErrorRes
		if err := json.Unmarshal(data, &errorRes); err != nil {
			return nil, err
		}

		logrus.WithField("error", errorRes).WithField("status", response.Status).Error("Error while authenticating")
		return nil, fmt.Errorf("%s", errorRes.ErrorDescription)
	}

	var authRes models.AuthRes
	if err := json.Unmarshal(data, &authRes); err != nil {
		return nil, err
	}

	return &authRes, nil
}

func (a Api) Me(accessToken string) (*models.Me, error) {
	r, err := a.get("/me", nil)
	if err != nil {
		return nil, err
	}

	var user models.Me
	if err := json.Unmarshal(r, &user); err != nil {
		return nil, err
	}

	return &user, nil
}
