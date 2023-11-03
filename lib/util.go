package lib

import (
	"strconv"

	"github.com/rawnly/splash-cli/lib/expressions"
	"github.com/rawnly/splash-cli/lib/slice"
	"github.com/spf13/viper"
)

const AliasViperKey = "aliases"

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

func ParsePhotoIDFromUrl(urlOrId string) string {
	if expressions.IsPhotoUrl(urlOrId) {
		return expressions.CleanupUrl(urlOrId)
	}

	return urlOrId
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

