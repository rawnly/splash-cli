package commands

import (
	"context"
	"fmt"
	"github.com/briandowns/spinner"
	"github.com/eiannone/keyboard"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/storage"
	"github.com/rawnly/splash-cli/unsplash"
	"github.com/rawnly/splash-cli/unsplash/models"
	"github.com/reujab/wallpaper"
	"github.com/spf13/cobra"
	"os"
	"time"
)

type photoFlags struct {
	Day         bool   `json:"day"`
	Orientation string `json:"orientation"`
	Query       string `json:"query"`
	Id          string `json:"id"`
	Save        bool   `json:"save"`
	Scale       string `json:"scale"`
}

const SpinnerSpeed = 200 * time.Millisecond
const SpinnerType = 39

func handleSpinnerError(
	err error,
	s *spinner.Spinner,
	cmd *cobra.Command,
	message string,
) {
	if err == nil {
		return
	}

	s.FinalMSG = message
	s.Stop()
	cmd.PrintErr(err.Error())
	os.Exit(1)
}

func newSpinner(cmd *cobra.Command, message string) *spinner.Spinner {
	s := spinner.New(spinner.CharSets[SpinnerType], SpinnerSpeed)
	s.Writer = cmd.OutOrStdout()
	s.Suffix = " " + message

	return s
}

func GetRootCommand(api *unsplash.Api, ctx context.Context) *cobra.Command {
	flags := &photoFlags{
		Day: false,
	}

	cmd := &cobra.Command{
		Use:   "splash",
		Short: "Get a photo",
		Args:  cobra.NoArgs,
		Run: func(cmd *cobra.Command, args []string) {
			var photo *models.Photo
			var err error

			s := ctx.Value("storage").(storage.Storage)

			ConnectionSpinnerSuffix := []string{" Connecting to Unsplash...", "Failed to connect\n", "✔ Connected"}
			DownloadSpinnerSuffix := []string{" Downloading photo...", "Failed to download\n", "✔ Downloaded"}
			SetWallpaperSpinnerSuffix := []string{" Setting wallpaper...", "Failed to set wallpaper\n", "✔ Wallpaper set"}

			connectionSpinner := newSpinner(cmd, ConnectionSpinnerSuffix[0])
			connectionSpinner.Start()

			if flags.Day {

				if s.Data.PhotoOfTheDayId != "" {
					photo, err = api.GetPhoto(s.Data.PhotoOfTheDayId)
				} else {
					photo, err = api.GetPhotoOfTheDay()

					s.Data.PhotoOfTheDayId = photo.Id
					s.Data.PhotoOfTheDayUrl = photo.Urls.Raw
					s.Data.PhotoOfTheDayDate = time.Now().Unix()

					if err := s.Save(); err != nil {
						handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[2])
					}
				}

				handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[1])
			} else if flags.Id != "" {
				photo, err = api.GetPhoto(flags.Id)
				handleSpinnerError(err, connectionSpinner, cmd, ConnectionSpinnerSuffix[1])
			} else {
				photos, err := api.GetRandomPhoto(models.RandomPhotoParams{
					Orientation: flags.Orientation,
					Query:       flags.Query,
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

			if lib.FileExists(downloadLocation) {
				location = downloadLocation

				downloadSpinner.FinalMSG = "[SKIPPED] Download"
				downloadSpinner.Stop()
			} else {
				location, err = unsplash.DownloadPhoto(photo.Urls.Raw, downloadLocation)

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

			if flags.Save {
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

	cmd.Flags().StringVar(&flags.Scale, "scale", "auto", "Set wallpaper scale")
	cmd.Flags().BoolVar(&flags.Day, "day", false, "Get a the photo of the day")
	cmd.Flags().StringVar(&flags.Orientation, "orientation", "landscape", "Get a random photo with the specified orientation")
	cmd.Flags().StringVar(&flags.Query, "query", "", "Get a random photo with the specified query")
	cmd.Flags().StringVar(&flags.Id, "id", "", "Get a specific photo by id")
	cmd.Flags().BoolVar(&flags.Save, "save", false, "Save the photo without setting it as wallpaper")

	return cmd
}
