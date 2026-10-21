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
	RunE: func(cmd *cobra.Command, args []string) error {
		key := args[0]
		value := args[1]

		if KeyMapping[key] == "" {
			return UnknownKey(key)
		}

		viper.Set(KeyMapping[key], value)

		err := viper.WriteConfig()
		if err != nil {
			return err
		}

		newVal := viper.GetString(KeyMapping[key])
		terminal.Clear()
		fmt.Println("")
		fmt.Printf("Setting updated to %s\n", ansi.Color(newVal, "yellow+u+b"))
		fmt.Println("")
		return nil
	},
}

func init() {

}
