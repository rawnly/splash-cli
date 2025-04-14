package keys

import (
	"context"

	"github.com/rawnly/splash-cli/lib/analytics"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/spf13/cast"
)

type contextKey string

const (
	APIInstance contextKey = "api"
	IsLogged    contextKey = "isLoggedIn"
	Analytics   contextKey = "analytics"
)

func GetAnalyticsInstance(ctx context.Context) *analytics.Analytics {
	return ctx.Value(Analytics).(*analytics.Analytics)
}

func GetAPIInstance(ctx context.Context) unsplash.Api {
	return ctx.Value(APIInstance).(unsplash.Api)
}

func IsLoggedIn(ctx context.Context) bool {
	return cast.ToBool(ctx.Value(IsLogged))
}
