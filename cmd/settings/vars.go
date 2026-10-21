package settings

import (
	"fmt"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/terminal"
)

const SETTINGS_AUTO_LIKE = "auto_like_photos"
const SETTINGS_DOWNLOADS_DIR = "download_dir"
const SETTINGS_STORE_BY_USERNAME = "store_by_username"

var KeyMapping = map[string]string{
	"downloads-dir":    SETTINGS_DOWNLOADS_DIR,
	"auto-like":        SETTINGS_AUTO_LIKE,
	"username-storage": SETTINGS_STORE_BY_USERNAME,
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

	return fmt.Errorf("unknown settings key: %s", key)
}
