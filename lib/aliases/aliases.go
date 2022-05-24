package aliases

import (
	"github.com/spf13/viper"
)

const AliasViperKey = "aliases"

type Aliases = map[string]string

func GetAll() Aliases {
	return viper.GetStringMapString(AliasViperKey)
}

func Resolve(alias string) string {
	return GetAll()[alias]
}

func Set(key string, value string) error {
	if err := RemoveAlias(key); err != nil {
		return err
	}

	aliases := GetAll()
	aliases[key] = value

	viper.Set(AliasViperKey, aliases)

	return viper.WriteConfig()
}

func RemoveAlias(key string) error {
	aliases := GetAll()
	delete(aliases, key)

	return viper.WriteConfig()
}
