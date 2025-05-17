package tokens

import (
	"os/user"
	"strings"

	"github.com/spf13/cobra"
	"github.com/zalando/go-keyring"
)

func username() string {
	u, err := user.Current()
	cobra.CheckErr(err)

	return u.Username
}

const (
	keyPrefix           = "splash-cli"
	accessTokenKeyName  = "access_token"
	refreshTokenKeyName = "refresh_token"
)

func Key(s string) string {
	return keyPrefix + ":" + strings.ToLower(strings.ReplaceAll(s, " ", "_"))
}

func SetAccessToken(token string) error {
	key := Key(accessTokenKeyName)
	return keyring.Set(key, username(), token)
}

func SetRefreshToken(token string) error {
	key := Key(refreshTokenKeyName)
	return keyring.Set(key, username(), token)
}

func GetAccessToken() string {
	key := Key(accessTokenKeyName)
	token, err := keyring.Get(key, username())
	if err != nil {
		return ""
	}

	return token
}

func GetRefreshToken() string {
	key := Key(refreshTokenKeyName)
	token, err := keyring.Get(key, username())
	if err != nil {
		return ""
	}

	return token
}

func Clear() error {
	accessTokenKey := Key(accessTokenKeyName)
	refreshTokenKey := Key(refreshTokenKeyName)

	if err := keyring.Delete(accessTokenKey, username()); err != nil {
		return err
	}

	if err := keyring.Delete(refreshTokenKey, username()); err != nil {
		return err
	}

	return nil
}
