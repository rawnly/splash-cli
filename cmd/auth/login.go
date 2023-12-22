package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/briandowns/spinner"
	"github.com/rawnly/splash-cli/lib/console"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var loginCmd = &cobra.Command{
	Use:  "login",
	Long: "Authenticate with Unsplash",
	Annotations: map[string]string{
		"flow": "user-auth",
	},
	Run: func(cmd *cobra.Command, args []string) {
		codeChan := make(chan string)

		sp := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
		sp.Suffix = " Waiting for authcode..."

		ctx := cmd.Context()
		api := keys.GetApiInstance(ctx)

		fmt.Println("Please visit the following URL to login:")
		authenticationUrl := api.BuildAuthenticationUrl(
			"read_user",
			"write_likes",
			"public",
			"read_collections",
			"write_collections",
		)

		terminal.HyperLink("Click to Login", authenticationUrl)

		fmt.Println("")
		sp.Start()

		go loginServer(codeChan, &api, ctx)

		sp.Suffix = " Authenticating..."

		code := <-codeChan
		res, err := api.Authenticate(code)
		if err != nil {
			sp.FinalMSG = "An error occured while authenticating"
			sp.Stop()
			cmd.PrintErr(err)
			return
		}

		viper.Set("auth.access_token", res.AccessToken)
		viper.Set("auth.refresh_token", res.RefreshToken)

		if err := viper.WriteConfig(); err != nil {
			sp.FinalMSG = "An error occurred while saving data."
			sp.Stop()
			cmd.PrintErr(err)
			return
		}

		me, err := api.Me()

		if err == nil {
			sp.Stop()
			fmt.Println(fmt.Sprintf("Welcome %s!", console.Yellow(me.Username)))
			return
		}

		sp.FinalMSG = "Welcome to Splash!"
		sp.Stop()

		fmt.Println("")
		fmt.Println("An error occured while fetching your data.")

		viper.Set("user_id", me.Id)
		_ = viper.WriteConfig()

		cmd.PrintErr(err)
	},
}

func init() {
	loginCmd.Flags().Bool("no-hyperlinks", false, "Disable hyperlinks")
	err := loginCmd.Flags().MarkHidden("no-hyperlinks")
	cobra.CheckErr(err)
}

func loginServer(code chan string, api *unsplash.Api, ctx context.Context) {
	authenticationUrl := api.BuildAuthenticationUrl(
		"read_user",
		"write_likes",
		"public",
		"read_collections",
		"write_collections",
	)

	srv := http.Server{
		Addr: ":8888",
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("code") != "" {
			code <- r.URL.Query().Get("code")
			if err := srv.Shutdown(ctx); err != nil {
				panic(err.Error())
			}
		}
	})

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, authenticationUrl, http.StatusTemporaryRedirect)
	})

	if err := srv.ListenAndServe(); err != http.ErrServerClosed && err != nil {
		panic(err.Error())
	}
}
