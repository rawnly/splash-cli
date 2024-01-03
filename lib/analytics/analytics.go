package analytics

import (
	"runtime"

	"github.com/AlecAivazis/survey/v2"
	"github.com/posthog/posthog-go"
	"github.com/rawnly/splash-cli/config"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

type Analytics struct {
	client  posthog.Client
	Enabled bool
}

func New(apiKey string) *Analytics {
	if apiKey == "YOUR_POSTHOG_KEY" || config.IsDebug() {
		return &Analytics{
			Enabled: false,
		}
	}

	client, err := posthog.NewWithConfig(
		apiKey,
		posthog.Config{
			Endpoint: "https://eu.posthog.com",
		},
	)
	if err != nil {
		logrus.Debug("Error while initializing posthog client: ", err)
		return nil
	}

	return &Analytics{
		Enabled: viper.GetBool("user_opt_out_analytics") == false,
		client:  client,
	}
}

func (a *Analytics) Close() error {
	if a.client == nil {
		return nil
	}

	return a.client.Close()
}

func (a *Analytics) PromptConsent() bool {
	confirm := true
	prompt := &survey.Confirm{
		Default: true,
		Message: "Would you like to help us improve the app by sending anonymous analytics?",
	}

	if err := survey.AskOne(prompt, &confirm); err != nil {
		return false
	}

	viper.Set("user_opt_out_analytics", !confirm)

	if !confirm {
		a.Enabled = false
	} else {
		a.Enabled = config.IsPostHogEnabled()
	}

	_ = a.Capture("user_opt_out_analytics", map[string]interface{}{
		"opt_out": !confirm,
	})

	return confirm
}

func (analytics *Analytics) Capture(event string, properties map[string]interface{}) error {
	if !analytics.Enabled {
		logrus.Tracef("Analytics disabled skipping event: %s", event)
		return nil
	}

	// default properties
	props := posthog.NewProperties().
		Set("version", config.GetVersion()).
		Set("os", runtime.GOOS).
		Set("arch", runtime.GOARCH).
		Set("go_version", runtime.Version())

	if properties != nil {
		for key, value := range properties {
			props = props.Set(key, value)
		}
	}

	logrus.Tracef("Capturing event: %s", event)

	err := analytics.client.Enqueue(posthog.Capture{
		// TODO: : generate a uuid or use the unsplash id
		DistinctId: viper.GetString("user_id"),
		Event:      event,
		Properties: props,
	})
	cobra.CheckErr(err)

	return nil
}
