package keys

import (
	"context"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/spf13/cast"
)

const (
	ApiInstance = "api"
	IsLogged    = "isLoggedIn"
)

func GetApiInstance(ctx context.Context) unsplash.Api {
	return ctx.Value(ApiInstance).(unsplash.Api)
}

func IsLoggedIn(ctx context.Context) bool {
	return cast.ToBool(ctx.Value(IsLogged))
}
