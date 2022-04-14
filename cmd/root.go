package cmd

import (
	"context"
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/briandowns/spinner"
	"github.com/eiannone/keyboard"
	"github.com/rawnly/splash-cli/cmd/auth"
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/rawnly/splash-cli/unsplash/models"
	"github.com/reujab/wallpaper"
	"github.com/spf13/cast"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"os"
	"time"
)

type photoFlags struct {
	Day         bool   `json:"day" description:"Get a the photo of the day"`
	Orientation string `json:"orientation" default:"landscape" description:"Specifies the photo orientation"`
	Query       string `json:"query" description:"Search for a photo"`
	Id          string `json:"id" description:"Get a photo by id"`
	Save        bool   `json:"save" description:"Save the photo without setting it as wallpaper"`
	Scale       string `json:"scale" default:"auto" description:"Set wallpaper scale"`
	IgnoreCache bool   `json:"ignore-cache" default:"false" description:"Ignore cache and download image again"`
}

const SpinnerSpeed = 200 * time.Millisecond
const SpinnerType = 39

func handleSpinnerError(
	err error,
	s *spinner.Spinner,
	_ *cobra.Command,
	message string,
) {
	if err == nil {
		return
	}

	s.FinalMSG = message
	s.Stop()

	cobra.CheckErr(err)
}

func newSpinner(cmd *cobra.Command, message string) *spinner.Spinner {
	s := spinner.New(spinner.CharSets[SpinnerType], SpinnerSpeed)
	s.Writer = cmd.OutOrStdout()
	s.Suffix = " " + message

	return s
}

var rootCmd = &cobra.Command{
	Use:     "splash",
	Short:   "Get a photo",
	Args:    cobra.NoArgs,
	Version: config.GetVersion(),
	Example: heredoc.Doc(`
			$ splash --day
			$ splash --query "mountains" --orientation "landscape"
		`),
	Annotations: map[string]string{
		"help:arguments": heredoc.Doc(`
				--day
				--orientation "landscape"
				--query "mountains"
			`),
	},
	Run: func(cmd *cobra.Command, args []string) {
		var photo *models.Photo
		var err error

		ctx := cmd.Context()
		api := ctx.Value("api").(unsplash.Api)

		photoOfTheDayId := viper.GetString("photo-of-the-day.id")

		ConnectionSpinnerSuffix := []string{" Connecting to Unsplash...", "Failed to connect\n", "✔ Connected"}
		DownloadSpinnerSuffix := []string{" Downloading photo...", "Failed to download\n", "✔ Downloaded"}
		SetWallpaperSpinnerSuffix := []string{" Setting wallpaper...", "Failed to set wallpaper\n", "✔ Wallpaper set"}

		connectionSpinner := newSpinner(cmd, ConnectionSpinnerSuffix[0])
		connectionSpinner.Start()

		// Parse Flags
		dayFlag, err := cmd.Flags().GetBool("day")
		cobra.CheckErr(err)

		ignoreCacheFlag, err := cmd.Flags().GetBool("no-cache")
		cobra.CheckErr(err)

		orientationFlag, err := cmd.Flags().GetString("orientation")
		cobra.CheckErr(err)

		queryFlag, err := cmd.Flags().GetString("query")
		cobra.CheckErr(err)

		idFlag, err := cmd.Flags().GetString("id")
		cobra.CheckErr(err)

		saveFlag, err := cmd.Flags().GetBool("save")
		cobra.CheckErr(err)

		if dayFlag {
			if photoOfTheDayId != "" && !ignoreCacheFlag {
				photo, err = api.GetPhoto(photoOfTheDayId)
			} else {
				photo, err = api.GetPhotoOfTheDay()

				viper.Set("photo-of-the-day.id", photo.Id)
				viper.Set("photo-of-the-day.last-update", time.Now().Unix())

				if err := viper.WriteConfig(); err != nil {
					connectionSpinner.Stop()
					fmt.Println("Failed to save config")
					cobra.CheckErr(err)
				}

				if err := viper.WriteConfig(); err != nil {
					handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[2])
				}
			}

			handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[1])
		} else if idFlag != "" {
			photo, err = api.GetPhoto(idFlag)
			handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[1])
		} else {
			photos, err := api.GetRandomPhoto(models.RandomPhotoParams{
				Orientation: orientationFlag,
				Query:       queryFlag,
				Count:       1,
			})

			handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[1])

			if len(photos) > 0 {
				photo = &photos[0]
			}
		}

		connectionSpinner.FinalMSG = ConnectionSpinnerSuffix[2]
		connectionSpinner.Stop()

		fmt.Println("")

		downloadSpinner := newSpinner(cmd, DownloadSpinnerSuffix[0])
		downloadSpinner.Start()

		downloadLocation, err := lib.HomeFile(fmt.Sprintf("Pictures/%s.jpg", photo.Id))
		handleSpinnerError(err, downloadSpinner, cmd, DownloadSpinnerSuffix[1])

		var location string

		if lib.FileExists(downloadLocation) && !ignoreCacheFlag {
			location = downloadLocation

			downloadSpinner.FinalMSG = "[SKIPPED] Download"
			downloadSpinner.Stop()
		} else {
			location, err = lib.DownloadFile(photo.Urls.Raw, downloadLocation)

			if err != nil {
				downloadSpinner.FinalMSG = "[FAILED] Download"
				downloadSpinner.Stop()

				fmt.Println("")
				fmt.Println("")

				wallpaperSpinner := newSpinner(cmd, SetWallpaperSpinnerSuffix[1])
				wallpaperSpinner.FinalMSG = SetWallpaperSpinnerSuffix[2]

				fmt.Println("Could not set wallpaper from file.")
				fmt.Println("Would you like to set it from the URL?")
				fmt.Println("")

				_, key, err := keyboard.GetSingleKey()
				if err != nil {
					panic(err.Error())
				}

				switch key {
				case keyboard.KeyEnter:
					wallpaperSpinner.Suffix = SetWallpaperSpinnerSuffix[0]
					wallpaperSpinner.FinalMSG = ""
					wallpaperSpinner.Start()

					err = wallpaper.SetFromURL(photo.Urls.Full)
					handleSpinnerError(err, wallpaperSpinner, cmd, SetWallpaperSpinnerSuffix[1])

					wallpaperSpinner.FinalMSG = SetWallpaperSpinnerSuffix[2]
					wallpaperSpinner.Stop()

					os.Exit(0)
				default:
					fmt.Println("Wallpaper not set.")
					os.Exit(1)
				}
			}

			downloadSpinner.FinalMSG = DownloadSpinnerSuffix[2]
			downloadSpinner.Stop()
		}

		fmt.Println("")

		if cast.ToBool(ctx.Value("isLoggedIn")) {
			err = api.Like(photo.Id)
			cobra.CheckErr(err)
		}

		if saveFlag {
			fmt.Println("[SKIPPED] Wallpaper")
			return
		}

		wallpaperSpinner := newSpinner(cmd, SetWallpaperSpinnerSuffix[0])
		wallpaperSpinner.Start()

		err = wallpaper.SetFromFile(location)
		handleSpinnerError(err, wallpaperSpinner, cmd, SetWallpaperSpinnerSuffix[1])

		wallpaperSpinner.FinalMSG = SetWallpaperSpinnerSuffix[2]
		wallpaperSpinner.Stop()

		fmt.Println("")
	},
}

func init() {
	rootCmd.Flags().String("scale", "auto", "Set wallpaper scale")
	rootCmd.Flags().Bool("day", false, "Get a the photo of the day")
	rootCmd.Flags().StringP("orientation", "o", "landscape", "Get a random photo with the specified orientation")
	rootCmd.Flags().StringP("query", "q", "", "Get a random photo with the specified query")
	rootCmd.Flags().String("id", "", "Get a specific photo by id")
	rootCmd.Flags().BoolP("save", "s", false, "Save the photo without setting it as wallpaper")
	rootCmd.Flags().Bool("no-cache", false, "Ignore cache")

	rootCmd.AddCommand(auth.Command)
}

func Execute(ctx context.Context) {
	if err := rootCmd.ExecuteContext(ctx); err != nil {
		os.Exit(1)
	}
}
