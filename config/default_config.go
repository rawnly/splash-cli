package config

import (
	"reflect"
	"time"

	"github.com/spf13/viper"
)

type photoOfTheDayConfig struct {
	Id              string        `json:"id"`
	LastUpdate      int64         `json:"last_update"`
	RefreshInterval time.Duration `json:"refresh_interval"`
}

type authConfig struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type Value struct {
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}

type Config struct {
	DownloadDir       Value `json:"download_dir"`
	AutoLikePhotos    Value `json:"auto_like_photos"`
	CollectionAliases Value `json:"collection_aliases"`
	PhotoOfTheDay     Value `json:"photo_of_the_day"`
	Auth              Value `json:"auth"`
}

var DefaultUserConfig = Config{
	DownloadDir: Value{
		Key:   "download_dir",
		Value: "~/Pictures/splash_photos",
	},
	AutoLikePhotos: Value{
		Key:   "auto_like_photos",
		Value: false,
	},
	CollectionAliases: Value{
		Key:   "collection_aliases",
		Value: map[string]string{},
	},
	// used to cache last pohto of the day
	PhotoOfTheDay: Value{
		Key: "photo_of_the_day",
		Value: photoOfTheDayConfig{
			Id:              "",
			LastUpdate:      0,
			RefreshInterval: time.Hour * 6,
		},
	},
	// config used to store user authentication
	Auth: Value{
		Key: "auth",
		Value: authConfig{
			AccessToken:  "",
			RefreshToken: "",
		},
	},
}

func (c Config) LoadDefaults() {
	rangeOf(c, func(key string, value interface{}) {
		val := value.(Value)
		viper.SetDefault(val.Key, val.Value)
	})
}

func rangeOf(t any, fn func(key string, value interface{})) {
	v := reflect.ValueOf(t)

	for i := 0; i < v.NumField(); i++ {
		val := v.Field(i).Interface()
		key := v.Type().Field(i).Name
		jsonKey := v.Type().Field(i).Tag.Get("")

		if jsonKey != "" {
			fn(jsonKey, val)
		} else {
			fn(key, val)
		}
	}
}
