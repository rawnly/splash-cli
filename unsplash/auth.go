package unsplash

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/rawnly/splash-cli/unsplash/models"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

func (a Api) BuildAuthenticationUrl(scopes ...string) string {
	baseUrl := "https://unsplash.com/oauth/authorize"
	scope := strings.Join(scopes, "+")

	return fmt.Sprintf("%s?client_id=%s&redirect_uri=%s&scope=%s&response_type=code", baseUrl, a.ClientId, url.PathEscape(a.RedirectUri), scope)
}

func (a Api) Authenticate(code string) (*models.AuthRes, error) {
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

	var authRes models.AuthRes
	data, err = ioutil.ReadAll(response.Body)

	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, &authRes); err != nil {
		return nil, err
	}

	return &authRes, nil
}

func (a Api) Me() (*models.Me, error) {
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
