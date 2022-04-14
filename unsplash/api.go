package unsplash

import (
	"net/http"
)

type Api struct {
	ClientId     string
	ClientSecret string
	RedirectUri  string
	Client       http.Client
}
