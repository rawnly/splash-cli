package settings

import (
	"fmt"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
	"os"
)

var KeyMapping = map[string]string{
	"askforlike":         "auto_like_photos",
	"like":               "auto_like_photos",
	"directory":          "download_dir",
	"downloads":          "download_dir",
	"download-directory": "download_dir",
}

func UnknownKey(key string) {
	template := "Settings key: {{ color \"cyan+b\" .key }} {{ color \"red+b\" \"NOT\" }} available.\n"

	text, err := lib.StringTemplate(template, map[string]string{
		"key": key,
	})
	cobra.CheckErr(err)

	terminal.Clear()
	fmt.Println("")
	fmt.Println(text)
	fmt.Println("Available keys:")

	for key := range KeyMapping {
		fmt.Println("  - " + key)
	}

	os.Exit(1)
}
