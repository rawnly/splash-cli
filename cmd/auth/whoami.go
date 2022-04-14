package auth

import (
	"fmt"
	"github.com/rawnly/splash-cli/lib/console"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/spf13/cobra"
	"os"
)

var whoamiCmd = &cobra.Command{
	Use:     "whoami",
	Args:    cobra.NoArgs,
	Long:    "Info about the current user",
	Aliases: []string{"user", "me"},
	Example: "splash auth whoami",
	PreRun: func(cmd *cobra.Command, args []string) {
		ctx := cmd.Context()

		if keys.IsLoggedIn(ctx) {
			return
		}

		cmd.Println("You are not logged in.")
		fmt.Println("Please login first.")

		os.Exit(1)
	},
	Run: func(cmd *cobra.Command, args []string) {
		api := cmd.Context().Value("api").(unsplash.Api)
		me, err := api.Me()

		if err != nil {
			cmd.PrintErr(err)
			return
		}

		fmt.Println("")
		fmt.Println(fmt.Sprintf("%s %s", console.Yellow("Username:"), me.Username))
		fmt.Println(fmt.Sprintf("%s %s", console.Yellow("Name:"), me.FirstName+" "+me.LastName))
		fmt.Println(fmt.Sprintf("%s %s", console.Yellow("Bio:"), me.Bio))
		fmt.Println("")
	},
}
