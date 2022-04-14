package settings

import (
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

//	return printBlock(chalk`Settings key: "{cyan ${target}}" {red {bold NOT} available}.`);
var getConfigCmd = &cobra.Command{
	Use:     "get",
	Example: "\t $ splash settings get downloads-dir",
	Args:    cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		key := args[0]
		value := viper.GetString(KeyMapping[key])

		if KeyMapping[key] == "" {
			UnknownKey(key)
		}

		template := lib.Template{
			Template: heredoc.Doc(`Setting {{ color "yellow+u+b" .Key }} is {{ color "yellow+u+b" .Value }}`),
			Data: map[string]string{
				"Key":   key,
				"Value": value,
			},
		}

		output, err := template.String()
		cobra.CheckErr(err)

		terminal.Clear()

		fmt.Println("")
		fmt.Println(output)
		fmt.Println("")
	},
}

func init() {

}
