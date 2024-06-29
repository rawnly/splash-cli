package settings

import (
	"github.com/AlecAivazis/survey/v2"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var Cmd = &cobra.Command{
	Use:   "settings",
	Short: "Manage user settings",
	Aliases: []string{
		"config",
	},
	Example: heredoc.Doc(`
		$ splash settings # This will prompt a survey
		$ splash settings set downloads-dir ~/Downloads
		$ splash settings get autoLike
	`),
	Run: func(cmd *cobra.Command, args []string) {
		settings, err := AllSettingsSurvey()
		cobra.CheckErr(err)

		viper.Set(SettingsDownloadsDir, settings.DownloadsDir)
		viper.Set(SettingsAutoLike, settings.AutoLike)
		viper.Set(SettingsStoreByUsername, settings.StoreByUsername)
	},
}

func init() {
	Cmd.AddCommand(optOutAnalyticsCmd)
	Cmd.AddCommand(setConfigCmd)
	Cmd.AddCommand(getConfigCmd)
}

type Settings struct {
	AutoLike        bool   `survey:"autoLike"`
	DownloadsDir    string `survey:"downloadsDir"`
	StoreByUsername bool   `survey:"storeByUsername"`
}

func AllSettingsSurvey() (*Settings, error) {
	var settings Settings

	questions := []*survey.Question{
		{
			Name: "autoLike",
			Prompt: &survey.Confirm{
				Default: false,
				Message: "Would you like to `like` every downloaded photo?",
			},
		},
		{
			Name: "downloadsDir",
			Prompt: &survey.Input{
				Message: "Where would you like to download your photos?",
				Help:    "This is where your photos will be downloaded to.",
				Default: viper.GetString(SettingsDownloadsDir),
			},
		},
		{
			Name: "storeByUsername",
			Prompt: &survey.Confirm{
				Default: false,
				Message: "Would you like to store your photos by author username?",
			},
		},
	}

	if err := survey.Ask(questions, &settings); err != nil {
		return nil, err
	}

	return &settings, nil
}
