package alias

import (
	"fmt"
	"github.com/mgutz/ansi"
	"github.com/rawnly/splash-cli/lib/aliases"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
)

var setAliasCmd = &cobra.Command{
	Use:     "set",
	Example: "set <name> <collection-id>",
	Args:    cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		id := args[1]

		if err := aliases.Set(name, id); err != nil {
			return err
		}

		terminal.Clear()

		fmt.Println("")
		fmt.Printf("Collection %s aliased to %s\n", ansi.Color(id, "yellow+u+b"), ansi.Color(name, "yellow+u+b"))
		fmt.Println("")

		return nil
	},
}
