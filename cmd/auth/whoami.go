package auth

import (
	"fmt"

	"github.com/rawnly/splash-cli/lib/console"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/unsplash/tokens"
	"github.com/spf13/cobra"
)

var whoamiCmd = &cobra.Command{
	Use:     "whoami",
	Args:    cobra.NoArgs,
	Long:    "Info about the current user",
	Aliases: []string{"user", "me"},
	Example: "splash auth whoami",
	PreRunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		if keys.IsLoggedIn(ctx) {
			return nil
		}

		cmd.Println("You are not logged in.")
		fmt.Println("Please login first.")

		return fmt.Errorf("not logged in")
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		api := keys.GetAPIInstance(cmd.Context())

		accessToken := tokens.GetAccessToken()
		me, err := api.Me(accessToken)
		if err != nil {
			return err
		}

		fmt.Println("")
		fmt.Println(fmt.Sprintf("%s %s", console.Yellow("Username:"), me.Username))
		fmt.Println(fmt.Sprintf("%s %s", console.Yellow("Name:"), me.FirstName+" "+me.LastName))
		fmt.Println(fmt.Sprintf("%s %s", console.Yellow("Bio:"), me.Bio))
		fmt.Println("")
		return nil
	},
}
