package settings

import (
	"github.com/AlecAivazis/survey/v2"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

var Cmd = &cobra.Command{
	Use:   "settings",
	Short: "Manage user settings",
	Example: heredoc.Doc(`
		$ splash settings set downloads-dir ~/Downloads
		$ splash settings get autoLike
	`),
}

func init() {
	Cmd.AddCommand(setConfigCmd)
	Cmd.AddCommand(getConfigCmd)
}

type Settings struct {
	AutoLike        bool   `survey:"autoLike"`
	DownloadsDir    string `survey:"downloadsDir"`
	StoreByUsername bool   `survey:"storeByUsername"`
}

func SettingsSurvey() (*Settings, error) {
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
