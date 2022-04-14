package unsplash

import (
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/network"
	"github.com/spf13/viper"
	"net/http"
)

// Utilities
func (a Api) sendRequest(req *http.Request) ([]byte, error) {
	token := a.ClientId
	authorizationKind := network.AuthorizationKindClient

	accessToken := viper.GetString("access-token")

	if accessToken != "" {
		token = accessToken
		authorizationKind = network.AuthorizationKindBearer
	}

	network.AddAuthorization(req, authorizationKind, token)

	return network.ExecuteRequest(req)(a.Client)
}

func (a Api) get(pathname string, params interface{}) ([]byte, error) {
	req, err := network.Request("GET", pathname, params, nil)
	if err != nil {
		return nil, err
	}

	return a.sendRequest(req)
}

func (a Api) post(pathname string, params interface{}, body any) ([]byte, error) {
	req, err := network.Request("POST", pathname, params, body)

	if err != nil {
		return nil, err
	}

	return a.sendRequest(req)
}

func (a Api) buildUrl(pathname string, data map[string]string) (string, error) {
	return lib.Template{
		Data:     data,
		Template: pathname,
	}.String()
}
