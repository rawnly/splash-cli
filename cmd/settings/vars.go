package settings

import (
	"fmt"
	"os"

	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/terminal"
)

const (
	SettingsAutoLike        = "auto_like_photos"
	SettingsDownloadsDir    = "download_dir"
	SettingsStoreByUsername = "store_by_username"
)

var KeyMapping = map[string]string{
	"downloads-dir":    SettingsDownloadsDir,
	"auto-like":        SettingsAutoLike,
	"username-storage": SettingsStoreByUsername,
}

func UnknownKey(key string) error {
	template := "Settings key: {{ color \"cyan+b\" .key }} {{ color \"red+b\" \"NOT\" }} available.\n"

	text, err := lib.StringTemplate(template, map[string]string{
		"key": key,
	})
	if err != nil {
		return err
	}

	terminal.Clear()
	fmt.Println("")
	fmt.Println(text)
	fmt.Println("Available keys:")

	for key := range KeyMapping {
		fmt.Println("  - " + key)
	}

	os.Exit(1)
	return nil
}
