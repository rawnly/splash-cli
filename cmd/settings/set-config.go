package settings

import (
	"fmt"
	"github.com/mgutz/ansi"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var setConfigCmd = &cobra.Command{
	Use:  "set",
	Args: cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		value := args[1]

		if KeyMapping[key] == "" {
			UnknownKey(key)
		}

		viper.Set(KeyMapping[key], value)

		err := viper.WriteConfig()
		cobra.CheckErr(err)

		newVal := viper.GetString(KeyMapping[key])
		terminal.Clear()
		fmt.Println("")
		fmt.Printf("Setting updated to %s\n", ansi.Color(newVal, "yellow+u+b"))
		fmt.Println("")
	},
}

func init() {

}
