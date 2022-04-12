package network

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
)

const (
	AuthorizationKindBearer = "Bearer"
	AuthorizationKindClient = "Client-ID"
)

func Request(method string, pathname string, params interface{}, body any) (*http.Request, error) {
	url := fmt.Sprintf("https://api.unsplash.com%s", pathname)

	if params != nil {
		url += fmt.Sprintf("?%s", Stringify(params))
	}

	logrus.Debug(method, url)

	if body == nil {
		return http.NewRequest(method, url, nil)
	}

	payload, err := json.Marshal(body)

	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(method, url, bytes.NewBuffer(payload))

	if err != nil {
		return nil, err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")

	return req, nil
}

func AddAuthorization(req *http.Request, authorizationKind string, token string) {
	// limit the possibility of `authorizationKind` to be only `AuthorizationKindBearer` | `AuthorizationKindClient`
	if authorizationKind != AuthorizationKindBearer {
		authorizationKind = AuthorizationKindClient
	} else if authorizationKind != AuthorizationKindClient {
		authorizationKind = AuthorizationKindBearer
	}

	logrus.Debug("authorizationKind", authorizationKind, "token", token)
	req.Header.Add("Authorization", fmt.Sprintf("%s %s", authorizationKind, token))
}

func ExecuteRequest(req *http.Request) func(client http.Client) ([]byte, error) {
	return func(client http.Client) ([]byte, error) {
		response, err := client.Do(req)

		if err != nil {
			return nil, err
		}

		defer response.Body.Close()

		if IsError(response) {
			return nil, errors.New("Error: " + response.Status)
		}

		return ioutil.ReadAll(response.Body)
	}
}

func IsError(response *http.Response) bool {
	return response.StatusCode >= 300
}
