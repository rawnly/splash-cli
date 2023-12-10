package keys

import (
	"context"

	"github.com/rawnly/splash-cli/lib/analytics"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/spf13/cast"
)

const (
	ApiInstance = "api"
	IsLogged    = "isLoggedIn"
	Analytics   = "analytics"
)

func GetAnalyticsInstance(ctx context.Context) *analytics.Analytics {
	return ctx.Value(Analytics).(*analytics.Analytics)
}

func GetApiInstance(ctx context.Context) unsplash.Api {
	return ctx.Value(ApiInstance).(unsplash.Api)
}

func IsLoggedIn(ctx context.Context) bool {
	return cast.ToBool(ctx.Value(IsLogged))
}
