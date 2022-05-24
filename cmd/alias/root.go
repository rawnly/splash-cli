package alias

import (
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

var Cmd = &cobra.Command{
	Use:     "alias",
	Aliases: []string{"aliases"},
	Short:   "Manage collection aliases",
	Example: heredoc.Doc(`
		$ splash alias set landscapes 
		$ splash alias get landscapes
		$ splash alias remove landscapes
		$ splash alias rename landscapes landscapes-wallpapers
	`),
}

func init() {
	Cmd.AddCommand(setAliasCmd)
	Cmd.AddCommand(getAliasCmd)
	Cmd.AddCommand(removeAliasCmd)
	Cmd.AddCommand(renameAliasCmd)
}
