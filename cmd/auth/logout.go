package auth

import (
	"fmt"

	"github.com/MakeNowJust/heredoc"
	tokens "github.com/rawnly/splash-cli/unsplash/tokens"
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
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Println("Logging out...")

		tokens.Clear()

		viper.Set("auth.access_token", "")
		viper.Set("auth.refresh_token", "")

		if err := viper.WriteConfig(); err != nil {
			return err
		}

		fmt.Println("You have been logged out.")
		return nil
	},
}
