package auth

import "github.com/spf13/cobra"

var Cmd = &cobra.Command{
	Use:   "auth",
	Short: "Authenticate with Unsplash",
	Long:  "Authenticate with Unsplash",
}

func init() {
	Cmd.AddCommand(loginCmd)
	Cmd.AddCommand(logoutCmd)
	Cmd.AddCommand(whoamiCmd)
}
