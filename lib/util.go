package lib

import (
	"os/user"
	"strconv"

	"github.com/rawnly/splash-cli/lib/expressions"
	"github.com/rawnly/splash-cli/lib/slice"
	"github.com/spf13/viper"
)

const AliasViperKey = "aliases"

func GetHomeDir() string {
	usr, err := user.Current()
	if err != nil {
		panic(err)
	}

	return usr.HomeDir
}

// ExpandPath expands a path starting with ~ to the user's home directory
func ExpandPath(path string) string {
	if path[:2] == "~/" {
		return GetHomeDir() + path[1:]
	}

	return path
}

func ParseStringValue(value string) any {
	if value == "true" || value == "false" {
		val, err := strconv.ParseBool(value)
		if err != nil {
			return false
		}

		return val
	}

	val, err := strconv.Atoi(value)
	if err != nil {
		return value
	}

	return val
}

func ParsePhotoIDFromURL(urlOrID string) string {
	if expressions.IsPhotoUrl(urlOrID) {
		return expressions.CleanupUrl(urlOrID)
	}

	return urlOrID
}

func ParseCollections(collections []string) []string {
	return slice.Map(collections, func(collectionIdOrUrl string) string {
		if expressions.IsCollectionUrl(collectionIdOrUrl) {
			id, _ := expressions.ExtractCollectionId(collectionIdOrUrl)

			return id
		}

		aliasValue := viper.GetStringMapString("aliases")[collectionIdOrUrl]

		if aliasValue == "" {
			return collectionIdOrUrl
		}

		return aliasValue
	})
}

func ResolveAlias(alias string) (id string) {
	return viper.GetStringMapString(AliasViperKey)[alias]
}

func SetAlias(name string, value string) error {
	aliases := viper.GetStringMapString(AliasViperKey)
	delete(aliases, name)
	aliases[name] = value

	return viper.WriteConfig()
}
