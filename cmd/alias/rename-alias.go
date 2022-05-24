package alias

import (
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/rawnly/splash-cli/lib/aliases"
	"github.com/spf13/cobra"
)

var renameAliasCmd = &cobra.Command{
	Use:     "rename",
	Aliases: []string{"mv"},
	Args:    cobra.ExactArgs(2),
	Short:   "Rename an alias",
	Example: heredoc.Doc(`
		$ splash aliases rename landscapes landscapes-wallpaper
	`),
	RunE: func(cmd *cobra.Command, args []string) error {
		oldName := args[0]
		newName := args[1]

		id := aliases.Resolve(oldName)

		if err := aliases.Set(newName, id); err != nil {
			return err
		}

		fmt.Printf("Alias %s renamed to %s", oldName, newName)

		return nil
	},
}
