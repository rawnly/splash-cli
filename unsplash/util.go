package unsplash

import (
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/network"
	"github.com/rawnly/splash-cli/lib/storage"
	"net/http"
)

// Utilities
func (a Api) sendRequest(req *http.Request) ([]byte, error) {
	token := a.ClientId
	authorizationKind := network.AuthorizationKindClient

	if s := a.getStorage(); s != nil {
		token = s.Data.AccessToken
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

func (a Api) getStorage() *storage.Storage {
	v := a.Context.Value("storage")

	if v == nil {
		return nil
	}

	s := v.(storage.Storage)

	if err := s.Load(); err != nil {
		return nil
	}

	return &s
}

func (a Api) buildUrl(pathname string, data map[string]string) (string, error) {
	return lib.Template{
		Data:     data,
		Template: pathname,
	}.String()
}
