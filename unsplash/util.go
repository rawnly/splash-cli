package unsplash

import (
	"net/http"

	"github.com/rawnly/splash-cli/lib/network"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

// Utilities
func (a API) sendRequest(req *http.Request) ([]byte, error) {
	token := a.ClientID
	authorizationKind := network.AuthorizationKindClient

	accessToken := viper.GetString("auth.access_token")
	logrus.WithField("auth.accessToken", accessToken).Debug("ACCESS_TOKEN")

	if accessToken != "" {
		token = accessToken
		authorizationKind = network.AuthorizationKindBearer

		logrus.WithField("auth.accessToken", accessToken).Debug("Using access token")
	} else {
		logrus.WithField("clientId", token).Debug("Using clientId")
	}

	network.AddAuthorization(req, authorizationKind, token)

	return network.ExecuteRequest(req)(a.Client)
}

func (a API) get(pathname string, params interface{}) ([]byte, error) {
	req, err := network.Request("GET", pathname, params, nil)
	if err != nil {
		return nil, err
	}

	return a.sendRequest(req)
}

func (a API) post(pathname string, params interface{}, body any) ([]byte, error) {
	req, err := network.Request("POST", pathname, params, body)
	if err != nil {
		return nil, err
	}

	return a.sendRequest(req)
}

func (a API) delete(pathname string, params interface{}) ([]byte, error) {
	req, err := network.Request("DELETE", pathname, params, nil)
	if err != nil {
		return nil, err
	}

	return a.sendRequest(req)
}
