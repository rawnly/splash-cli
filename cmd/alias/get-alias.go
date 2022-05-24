package alias

import (
	"fmt"
	"github.com/mgutz/ansi"
	"github.com/rawnly/splash-cli/lib/aliases"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
)

var getAliasCmd = &cobra.Command{
	Use:     "get",
	Example: "get [collection-name]",
	Args:    cobra.RangeArgs(0, 1),
	RunE: func(cmd *cobra.Command, args []string) error {
		isRawOutput, err := cmd.Flags().GetBool("plain")
		cobra.CheckErr(err)

		if !isRawOutput {
			terminal.Clear()
		}

		if len(args) == 0 {
			output := ""

			if !isRawOutput {
				fmt.Println("Aliases:")
			}

			for k, id := range aliases.GetAll() {
				if isRawOutput {
					if len(output) == 0 {
						output = fmt.Sprintf("%s=%s", k, id)
					} else {
						output += "\n" + fmt.Sprintf("%s=%s", k, id)
					}

					continue
				}

				fmt.Printf("> %s => %s\n", ansi.Color(k, "yellow+u+b"), ansi.Color(id, "yellow+u+b"))
			}

			if isRawOutput {
				fmt.Println(output)
			}

			return nil
		}

		name := args[0]
		id := aliases.Resolve(name)

		if isRawOutput {
			fmt.Println(id)
			return nil
		}

		fmt.Println("")
		fmt.Printf("Collection %s is aliased to %s\n", ansi.Color(id, "yellow+u+b"), ansi.Color(name, "yellow+u+b"))
		fmt.Println("")

		return nil
	},
}
