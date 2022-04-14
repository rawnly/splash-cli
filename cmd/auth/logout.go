package auth

import (
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var logoutCmd = &cobra.Command{
	Use:          "logout",
	Long:         "Logout from Unsplash",
	Args:         cobra.NoArgs,
	SilenceUsage: true,
	Example: heredoc.Doc(`
		$ splash auth logout
	`),
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Logging out...")

		viper.Set("auth.access_token", "")
		viper.Set("auth.refresh_token", "")

		if err := viper.WriteConfig(); err != nil {
			cmd.PrintErr(err)
			return
		}

		fmt.Println("You have been logged out.")
	},
}
