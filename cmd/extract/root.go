package extract

import (
	"fmt"

	"github.com/rawnly/splash-cli/pkg/base16"
	"github.com/reujab/wallpaper"
	"github.com/spf13/cobra"
)

var flagPlatform base16.Platform

func init() {
	Cmd.Flags().Var(&flagPlatform, "platform", fmt.Sprintf("platform to extract colors for (%v)", flagPlatform.Values()))
}

var Cmd = &cobra.Command{
	Use:     "extract",
	Short:   "extract colors from the current wallpaper",
	Example: "splash extract -p wezterm",
	Aliases: []string{"export", "e"},
	RunE: func(cmd *cobra.Command, args []string) error {
		filepath, err := wallpaper.Get()
		if err != nil {
			return err
		}

		if flagPlatform.String() == "" {
			var json []byte
			_, json, err = base16.GetScheme(filepath)
			if err != nil {
				return err
			}

			fmt.Println(string(json))
			return nil
		}

		thm, err := base16.GetTheme(filepath, flagPlatform)
		if err != nil {
			return err
		}

		fmt.Println(thm)

		return nil
	},
}
