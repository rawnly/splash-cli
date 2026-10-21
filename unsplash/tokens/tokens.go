package tokens

import (
	"errors"
	"os/user"
	"strings"

	"github.com/zalando/go-keyring"
)

func username() (string, error) {
	u, err := user.Current()
	if err != nil {
		return "", err
	}
	return u.Username, nil
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
	name, err := username()
	if err != nil {
		return err
	}
	return keyring.Set(Key(accessTokenKeyName), name, token)
}

func SetRefreshToken(token string) error {
	name, err := username()
	if err != nil {
		return err
	}
	return keyring.Set(Key(refreshTokenKeyName), name, token)
}

func GetAccessToken() string {
	name, err := username()
	if err != nil {
		return ""
	}
	token, _ := keyring.Get(Key(accessTokenKeyName), name)
	return token
}

func GetRefreshToken() string {
	name, err := username()
	if err != nil {
		return ""
	}
	token, _ := keyring.Get(Key(refreshTokenKeyName), name)
	return token
}

func Clear() error {
	name, err := username()
	if err != nil {
		return err
	}
	for _, key := range []string{accessTokenKeyName, refreshTokenKeyName} {
		if err := keyring.Delete(Key(key), name); err != nil && !errors.Is(err, keyring.ErrNotFound) {
			return err
		}
	}
	return nil
}
