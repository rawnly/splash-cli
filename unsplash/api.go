package unsplash

import (
	"net/http"
)

type API struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
	Client       http.Client
}
