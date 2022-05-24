package alias

import (
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/rawnly/splash-cli/lib/aliases"
	"github.com/spf13/cobra"
)

var removeAliasCmd = &cobra.Command{
	Use:     "remove",
	Short:   "Remove an alias",
	Aliases: []string{"delete", "rm"},
	Args:    cobra.ExactArgs(1),
	Example: heredoc.Doc(`
		$ splash aliases remove landscapes
	`),
	RunE: func(cmd *cobra.Command, args []string) error {
		alias := args[0]
		id := aliases.Resolve(alias)

		if err := aliases.RemoveAlias(alias); err != nil {
			return err
		}

		fmt.Printf("Alias for collection \"%s\" (%s) removed.", id, alias)

		return nil
	},
}
