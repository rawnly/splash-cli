package settings

import (
	"fmt"

	"github.com/spf13/cobra"
)

var optOutAnalyticsCmd = &cobra.Command{
	Use:     "opt-out-analytics",
	Args:    cobra.ExactArgs(0),
	Long:    "Add this command to your shell profile to disable analytics",
	Short:   "Opt-out from analytics",
	Example: "eval \"$(splash settings opt-out-analytics)\"",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("export SPLASH_CLI_TELEMTRY_ENABLED=0")
	},
}
