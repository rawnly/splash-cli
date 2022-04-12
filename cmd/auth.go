package cmd

import (
	"context"
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/briandowns/spinner"
	"github.com/rawnly/splash-cli/lib/console"
	"github.com/rawnly/splash-cli/lib/storage"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/spf13/cobra"
	"net/http"
	"os"
	"time"
)

func GetAuthCommand(api *unsplash.Api, ctx context.Context) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "auth",
		Short: "Authenticate with Unsplash",
		Long:  "Authenticate with Unsplash",
	}

	cmd.AddCommand(GetAuthLoginCommand(api, ctx))
	cmd.AddCommand(GetAuthLogoutCommand(api, ctx))
	cmd.AddCommand(GetAuthMeCommand(api, ctx))

	return cmd
}

func GetAuthLoginCommand(api *unsplash.Api, ctx context.Context) *cobra.Command {
	flags := struct {
		NoHyperLinks bool
	}{}

	cmd := &cobra.Command{
		Use:  "login",
		Long: "Authenticate with Unsplash",
		Annotations: map[string]string{
			"flow": "user-auth",
		},
		Run: func(cmd *cobra.Command, args []string) {
			codeChan := make(chan string)
			sp := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
			sp.Suffix = " Waiting for authcode..."

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

			go loginServer(codeChan, api, ctx)

			sp.Suffix = " Authenticating..."

			code := <-codeChan
			res, err := api.Authenticate(code)

			if err != nil {
				sp.FinalMSG = "An error occured while authenticating"
				sp.Stop()
				cmd.PrintErr(err)
				return
			}

			s := ctx.Value("storage").(storage.Storage)

			s.Data.AccessToken = res.AccessToken
			s.Data.RefreshToken = res.RefreshToken

			if err := s.Save(); err != nil {
				sp.FinalMSG = "An error occured while saving data."
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

			cmd.PrintErr(err)
		},
	}

	cmd.
		Flags().
		BoolVar(&flags.NoHyperLinks, "no-hyperlinks", false, "Disable hyperlinks")

	if err := cmd.Flags().MarkHidden("no-hyperlinks"); err != nil {
		cmd.PrintErr(err.Error())
	}

	return cmd
}

func GetAuthLogoutCommand(_ *unsplash.Api, ctx context.Context) *cobra.Command {
	cmd := &cobra.Command{
		Use:          "logout",
		Long:         "Logout from Unsplash",
		Args:         cobra.NoArgs,
		SilenceUsage: true,
		Example: heredoc.Doc(`
			$ splash auth logout
		`),
		Annotations: map[string]string{
			"flow": "user-auth",
		},
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("Logging out...")

			s := ctx.Value("storage").(storage.Storage)

			s.Data.AccessToken = ""
			s.Data.RefreshToken = ""

			if err := s.Save(); err != nil {
				cmd.PrintErr(err)
				return
			}

			fmt.Println("You have been logged out.")
		},
	}

	return cmd
}

func GetAuthMeCommand(api *unsplash.Api, ctx context.Context) *cobra.Command {
	cmd := &cobra.Command{
		Use:     "me",
		Args:    cobra.NoArgs,
		Long:    "Get your Unsplash profile",
		Aliases: []string{"user"},
		Example: "splash auth me",
		PreRun: func(cmd *cobra.Command, args []string) {
			isLoggedIn := ctx.Value("isLoggedIn").(bool)

			if isLoggedIn {

				return
			}

			cmd.Println("You are not logged in.")
			cmd.Println("Please login via: 'splash auth login'")
			os.Exit(0)
		},
		Run: func(cmd *cobra.Command, args []string) {
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

	return cmd
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
