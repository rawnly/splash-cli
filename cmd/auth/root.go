package auth

import "github.com/spf13/cobra"

var Command = &cobra.Command{
	Use:   "auth",
	Short: "Authenticate with Unsplash",
	Long:  "Authenticate with Unsplash",
}

func init() {
	Command.AddCommand(loginCmd)
	Command.AddCommand(logoutCmd)
	Command.AddCommand(whoamiCmd)
}
