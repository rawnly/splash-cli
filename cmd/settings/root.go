package settings

import (
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

var Cmd = &cobra.Command{
	Use:   "settings",
	Short: "Manage user settings",
	Example: heredoc.Doc(`
		$ splash settings set downloads-dir ~/Downloads
		$ splash settings get autoLike
	`),
}

func init() {
	Cmd.AddCommand(setConfigCmd)
	Cmd.AddCommand(getConfigCmd)
}
