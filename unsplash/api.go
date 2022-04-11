package unsplash

import (
	"context"
	"net/http"
)

type Api struct {
	ClientId     string
	ClientSecret string
	RedirectUri  string
	Client       http.Client
	Context      context.Context
}
