package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/briandowns/spinner"
	"github.com/cli/browser"
	"github.com/rawnly/splash-cli/lib/console"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/rawnly/splash-cli/unsplash"
	tokens "github.com/rawnly/splash-cli/unsplash/tokens"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var loginCmd = &cobra.Command{
	Use:  "login",
	Long: "Authenticate with Unsplash",
	Annotations: map[string]string{
		"flow": "user-auth",
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		codeChan := make(chan string, 1)

		sp := spinner.New(spinner.CharSets[14], 100*time.Millisecond)
		sp.Suffix = " Waiting for authcode..."

		ctx := cmd.Context()
		status := terminal.Status(ctx)
		defer sp.Stop()
		api := keys.GetAPIInstance(ctx)

		status.Report("blocked", "auth", "Log in to Unsplash in your browser")
		fmt.Println("Please visit the following URL to login:")
		authenticationURL := api.BuildAuthenticationUrl(
			"read_user",
			"write_likes",
			"public",
			"read_collections",
			"write_collections",
		)

		terminal.HyperLink("Click to Login", authenticationURL)
		_ = browser.OpenURL(authenticationURL)

		fmt.Println("")
		sp.Start()

		serverCtx, cancel := context.WithCancel(ctx)
		defer cancel()
		serverErrors := make(chan error, 1)
		go func() {
			serverErrors <- loginServer(codeChan, &api, serverCtx)
		}()

		var code string
		select {
		case code = <-codeChan:
		case err := <-serverErrors:
			return err
		case <-ctx.Done():
			return ctx.Err()
		}
		sp.Suffix = " Authenticating..."
		status.Report("working", "", "Authenticating with Unsplash")
		res, err := api.Authenticate(code)
		if err != nil {
			sp.FinalMSG = "An error occured while authenticating\n"
			sp.Stop()

			return err
		}

		logrus.WithField("response", res).Debug("auth response")

		tokens.SetAccessToken(res.AccessToken)
		tokens.SetRefreshToken(res.RefreshToken)

		logrus.Debug("writing config")
		if err := viper.WriteConfig(); err != nil {
			logrus.WithField("error", err).Error("Error while saving config")

			sp.FinalMSG = "An error occurred while saving data."
			sp.Stop()

			return err
		}

		logrus.Debug("config updated")

		me, err := api.Me(res.AccessToken)
		if err != nil {
			sp.FinalMSG = "An error occured while fetching your data."
			sp.Stop()

			return err
		}

		sp.Stop()
		fmt.Println(fmt.Sprintf("Welcome %s!", console.Yellow(me.Username)))

		viper.Set("user_id", me.Id)
		return viper.WriteConfig()
	},
}

func init() {
	loginCmd.Flags().Bool("no-hyperlinks", false, "Disable hyperlinks")
	err := loginCmd.Flags().MarkHidden("no-hyperlinks")
	cobra.CheckErr(err)
}

func loginServer(code chan string, api *unsplash.Api, ctx context.Context) error {
	authenticationUrl := api.BuildAuthenticationUrl(
		"read_user",
		"write_likes",
		"public",
		"read_collections",
		"write_collections",
	)

	mux := http.NewServeMux()
	srv := http.Server{
		Addr:    ":5835",
		Handler: mux,
	}
	stop := context.AfterFunc(ctx, func() { _ = srv.Close() })
	defer stop()
	defer srv.Close()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if authCode := r.URL.Query().Get("code"); authCode != "" {
			select {
			case code <- authCode:
			case <-ctx.Done():
			}
		}
	})

	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, authenticationUrl, http.StatusTemporaryRedirect)
	})

	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return ctx.Err()
}
