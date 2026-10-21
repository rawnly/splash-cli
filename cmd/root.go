package cmd

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/AlecAivazis/survey/v2"
	surveyterminal "github.com/AlecAivazis/survey/v2/terminal"
	"github.com/MakeNowJust/heredoc"
	"github.com/briandowns/spinner"
	"github.com/cli/browser"
	"github.com/eiannone/keyboard"
	"github.com/rawnly/go-wallpaper"
	"github.com/rawnly/splash-cli/cmd/alias"
	"github.com/rawnly/splash-cli/cmd/auth"
	"github.com/rawnly/splash-cli/cmd/collection"
	"github.com/rawnly/splash-cli/cmd/settings"
	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/blurhash"
	"github.com/rawnly/splash-cli/lib/github"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/rawnly/splash-cli/unsplash/models"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

type photoFlags struct {
	Day         bool   `json:"day" description:"Get a the photo of the day"`
	Orientation string `json:"orientation" default:"landscape" description:"Specifies the photo orientation"`
	Query       string `json:"query" description:"Search for a photo"`
	ID          string `json:"id" description:"Get a photo by id"`
	Save        bool   `json:"save" description:"Save the photo without setting it as wallpaper"`
	Scale       string `json:"scale" default:"auto" description:"Set wallpaper scale"`
	IgnoreCache bool   `json:"ignore-cache" default:"false" description:"Ignore cache and download image again"`
}

const (
	SpinnerSpeed = 200 * time.Millisecond
	SpinnerType  = 39
)

func handleSpinnerError(err error, s *spinner.Spinner, message string) error {
	if err != nil {
		s.FinalMSG = message
		s.Stop()
	}
	return err
}

func newSpinner(cmd *cobra.Command, message string) *spinner.Spinner {
	s := spinner.New(spinner.CharSets[SpinnerType], SpinnerSpeed)
	s.Writer = cmd.OutOrStdout()
	s.Suffix = " " + message
	terminal.Status(cmd.Context()).Report("working", "", message)

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
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		plain, _ := cmd.Flags().GetBool("plain")
		status := terminal.Status(cmd.Context())
		if plain {
			status.Disable()
		}
		if isUtilityCommand(cmd) {
			status.Disable()
			return
		}
		status.Report("working", "", "Running "+cmd.CommandPath())
	},
	PersistentPostRunE: func(cmd *cobra.Command, args []string) error {
		if isUtilityCommand(cmd) {
			return nil
		}
		terminal.Status(cmd.Context()).Report("working", "", "Checking for updates")
		log.Debug().Msg("Checking for updates")

		lastCheck := viper.GetTime("update.last_update")

		if time.Since(lastCheck) < time.Hour*24 {
			log.Debug().
				Time("last_check", lastCheck).
				Int64("now", time.Now().Unix()).
				Str("version", viper.GetString("update.latest_tag")).
				Str("current_version", config.GetVersion()).
				Msg("Update check performed in the last 24 hours. Aborting check...")

			return nil
		}

		updateNeeded, version, err := github.NeedsToUpdate()
		if err != nil {
			log.Debug().Err(err).Msg("Update check failed")
			return nil
		}

		log.Debug().Bool("updateNeeded", updateNeeded).Any("version", version).Msg("Checking for updates")

		viper.Set("update.last_update", time.Now().Unix())
		viper.Set("update.latest_tag", version)
		_ = viper.WriteConfig()

		if updateNeeded && version != nil {
			prompt := &survey.Confirm{
				Default: true,
				Message: fmt.Sprintf("A new version (%s) is available, would you like to update?", version.String()),
			}

			confirm := true
			status := terminal.Status(cmd.Context())
			status.Report("blocked", "permission", prompt.Message)
			err := survey.AskOne(prompt, &confirm)
			status.Report("working", "", "Finishing update check")
			if err != nil {
				return err
			}

			if !confirm {
				return nil
			}

			_ = browser.OpenURL("https://github.com/rawnly/splash-cli/releases/latest")
		}
		return nil
	},
	RunE: func(cmd *cobra.Command, args []string) error {
		var photo *models.Photo
		var err error

		ctx := cmd.Context()
		status := terminal.Status(ctx)
		api := keys.GetAPIInstance(ctx)
		analytics := keys.GetAnalyticsInstance(ctx)

		photoOfTheDayID := viper.GetString("photo_of_the_day.id")

		ConnectionSpinnerSuffix := []string{" Connecting to Unsplash...", "Failed to connect\n", "✔ Connected"}
		DownloadSpinnerSuffix := []string{" Downloading photo...", "Failed to download\n", "✔ Downloaded"}
		SetWallpaperSpinnerSuffix := []string{" Setting wallpaper...", "Failed to set wallpaper\n", "✔ Wallpaper set"}

		terminal.Clear()

		connectionSpinner := newSpinner(cmd, ConnectionSpinnerSuffix[0])
		connectionSpinner.Start()
		defer connectionSpinner.Stop()

		// Parse Flags
		dayFlag, err := cmd.Flags().GetBool("day")
		if err != nil {
			return err
		}

		screenFlag, err := cmd.Flags().GetInt("screen")
		if err != nil {
			return err
		}

		ignoreCacheFlag, err := cmd.Flags().GetBool("no-cache")
		if err != nil {
			return err
		}

		orientationFlag, err := cmd.Flags().GetString("orientation")
		if err != nil {
			return err
		}

		queryFlag, err := cmd.Flags().GetString("query")
		if err != nil {
			return err
		}

		idFlag, err := cmd.Flags().GetString("id")
		if err != nil {
			return err
		}

		userFlag, err := cmd.Flags().GetString("user")
		if err != nil {
			return err
		}

		topicsFlag, err := cmd.Flags().GetStringSlice("topics")
		if err != nil {
			return err
		}

		collectionsFlag, err := cmd.Flags().GetStringSlice("collections")
		if err != nil {
			return err
		}

		saveFlag, err := cmd.Flags().GetBool("save")
		if err != nil {
			return err
		}

		if dayFlag {
			analytics.Capture("photo_of_the_day", nil)

			if photoOfTheDayID != "" && !ignoreCacheFlag {
				photo, err = api.GetPhoto(photoOfTheDayID)
			} else {
				photo, err = api.GetPhotoOfTheDay()
				if err != nil {
					return fmt.Errorf("failed to get photo of the day: %w", err)
				}

				viper.Set("photo_of_the_day.id", photo.Id)
				viper.Set("photo_of_the_day.last_update", time.Now().Unix())

				if err = viper.WriteConfig(); err != nil {
					connectionSpinner.Stop()
					return fmt.Errorf("failed to save settings: %w", err)
				}
			}

			if err := handleSpinnerError(err, connectionSpinner, ConnectionSpinnerSuffix[1]); err != nil {
				return err
			}
		} else if idFlag != "" {
			idFlag = lib.ParsePhotoIDFromURL(idFlag)

			analytics.Capture("photo_by_id", map[string]any{
				"photo_id": idFlag,
			})

			photo, err = api.GetPhoto(idFlag)
			if err := handleSpinnerError(err, connectionSpinner, ConnectionSpinnerSuffix[1]); err != nil {
				return err
			}
		} else {
			analytics.Capture("random_photo", nil)

			var photos []models.Photo
			photos, err = api.GetRandomPhoto(models.RandomPhotoParams{
				Orientation: orientationFlag,
				Query:       queryFlag,
				Count:       1,
				Username:    userFlag,
				Topics:      topicsFlag,
				Collections: lib.ParseCollections(collectionsFlag),
			})

			if err := handleSpinnerError(err, connectionSpinner, ConnectionSpinnerSuffix[1]); err != nil {
				return err
			}

			if len(photos) > 0 {
				photo = &photos[0]
			}
		}

		if photo == nil {
			return errors.New("no photos found")
		}

		connectionSpinner.FinalMSG = ConnectionSpinnerSuffix[2]
		connectionSpinner.Stop()

		fmt.Println("")

		downloadSpinner := newSpinner(cmd, DownloadSpinnerSuffix[0])
		downloadSpinner.Start()
		defer downloadSpinner.Stop()

		downloadFolder := viper.GetString("download_dir")

		if downloadFolder == "" {
			var folder string
			folder, err = lib.HomePath("Pictures")
			if err := handleSpinnerError(err, downloadSpinner, DownloadSpinnerSuffix[1]); err != nil {
				return err
			}

			downloadFolder = folder
		}

		downloadLocation := fmt.Sprintf("%s/%s.jpg", downloadFolder, photo.Id)

		if !saveFlag {
			_ = blurhash.Prepare(photo)
		}

		var location string

		// debug printing
		fmt.Println("Download location:", downloadLocation)
		fmt.Println("Ignore cache:", ignoreCacheFlag)
		fmt.Println("File exists:", lib.FileExists(downloadLocation))

		if lib.FileExists(downloadLocation) && !ignoreCacheFlag {
			location = downloadLocation

			downloadSpinner.FinalMSG = "[SKIPPED] Download"
			downloadSpinner.Stop()
		} else {
			location, err = lib.DownloadFile(photo.Urls.Raw, downloadLocation)
			if err != nil {
				if saveFlag {
					return fmt.Errorf("failed to download photo: %w", err)
				}
				downloadSpinner.FinalMSG = "[FAILED] Download"
				downloadSpinner.Stop()

				fmt.Println("")
				fmt.Println("")

				wallpaperSpinner := newSpinner(cmd, SetWallpaperSpinnerSuffix[1])
				wallpaperSpinner.FinalMSG = SetWallpaperSpinnerSuffix[2]

				fmt.Println("Could not set wallpaper from file.")
				fmt.Println("Would you like to set it from the URL?")
				fmt.Println("")

				status.Report("blocked", "permission", "Download failed. Set wallpaper from the URL?")
				var key keyboard.Key
				_, key, err = keyboard.GetSingleKey()
				if err != nil {
					return err
				}

				switch key {
				case keyboard.KeyEnter:
					wallpaperSpinner.Suffix = SetWallpaperSpinnerSuffix[0]
					wallpaperSpinner.FinalMSG = ""
					wallpaperSpinner.Start()

					status.Report("working", "", "Setting wallpaper from URL")
					err = wallpaper.SetFromURL(photo.Urls.Full, screenFlag)
					if err := handleSpinnerError(err, wallpaperSpinner, SetWallpaperSpinnerSuffix[1]); err != nil {
						return err
					}

					wallpaperSpinner.FinalMSG = SetWallpaperSpinnerSuffix[2]
					wallpaperSpinner.Stop()

					return nil
				default:
					fmt.Println("Wallpaper not set.")
					return errCancelled
				}
			}

			downloadSpinner.FinalMSG = DownloadSpinnerSuffix[2]
			downloadSpinner.Stop()
		}

		fmt.Println("")

		if saveFlag {
			fmt.Println("[SKIPPED] Wallpaper")
			return nil
		}

		wallpaperSpinner := newSpinner(cmd, SetWallpaperSpinnerSuffix[0])
		wallpaperSpinner.Start()

		err = wallpaper.SetFromFile(location, screenFlag)
		if err := handleSpinnerError(err, wallpaperSpinner, SetWallpaperSpinnerSuffix[1]); err != nil {
			return err
		}

		wallpaperSpinner.FinalMSG = SetWallpaperSpinnerSuffix[2]
		wallpaperSpinner.Stop()

		terminal.Clear()

		// Print photo data
		fmt.Println("")
		text, err := lib.StringTemplate(heredoc.Doc(`
			{{ if .Description }} {{ color "dim+h" ">"}} {{ color "dim+h" .Description }}{{ end }}

			Downloads: {{ formatNumber .Downloads }}
			Views: {{ formatNumber .Views }}
			Liked by {{ formatNumber .Likes }} users

			Shot by {{ color "cyan+b" .User.Name }} (@{{ color "yellow" .User.Username }})
		`), photo)
		if err != nil {
			return err
		}

		fmt.Println(text)

		if !keys.IsLoggedIn(ctx) {
			fmt.Println("Login to like this photo.")
		} else if photo.LikedByUser {
			fmt.Println("❤️  You liked this photo.")
		} else {
			// if the key is true then the user allows us to like the photo automatically when is downloaded
			autoLikeEnabled := viper.GetBool(config.DefaultUserConfig.AutoLikePhotos.Key)

			if autoLikeEnabled {
				status.Report("working", "", "Liking photo")
				if err := api.Like(photo.Id); err != nil {
					return err
				}

				fmt.Println("Liked!")

				return nil
			}

			shouldLike := false
			status.Report("blocked", "question", "Do you like this photo?")

			err := survey.AskOne(&survey.Confirm{
				Default: false,
				Message: "Do you like this photo?",
			}, &shouldLike)
			if err != nil {
				return err
			}
			status.Report("working", "", "Finishing photo")

			if shouldLike {
				if err := api.Like(photo.Id); err != nil {
					return err
				}

				fmt.Println("Liked!")
			}
		}
		return nil
	},
}

func init() {
	rootCmd.Flags().String("scale", "auto", "Set wallpaper scale")
	rootCmd.Flags().Bool("day", false, "Retrieve the photo of the day")
	rootCmd.Flags().StringP("orientation", "o", "landscape", "Filter by photo orientation")
	rootCmd.Flags().StringP("query", "q", "", "Limit selection to photos matching a search term.")
	rootCmd.Flags().StringSliceP("topics", "t", []string{}, "Public topic ID(s) to filter selection. If multiple, comma-separated")
	rootCmd.Flags().StringSliceP("collections", "c", []string{}, "Public collection ID(s) to filter selection. If multiple, comma-separated")
	rootCmd.Flags().StringP("user", "u", "", "Limit selection to a single user.")
	rootCmd.Flags().String("id", "", "Retrieve a single photo by ID")
	rootCmd.Flags().BoolP("save", "s", false, "Save the photo without setting it as wallpaper")
	rootCmd.Flags().Int("screen", -1, "Set wallpaper on a specific screen. (macos only)")
	rootCmd.Flags().Bool("no-cache", false, "Ignore cache")
	// rootCmd.Flags().Bool("quiet", false, "Hide spinners / prompts")
	rootCmd.PersistentFlags().Bool("plain", false, "Plain output. Good for tty")

	rootCmd.AddCommand(auth.Cmd)
	rootCmd.AddCommand(alias.Cmd)
	rootCmd.AddCommand(settings.Cmd)
	rootCmd.AddCommand(collection.Cmd)

	rootCmd.SetVersionTemplate("{{ .Version }}")
}

var errCancelled = errors.New("cancelled")

// Execute runs commands with terminal status reporting. prepare runs after flag
// parsing and status setup, before command work, but never for help or completion.
func Execute(ctx context.Context, prepare func(*cobra.Command) error) error {
	status := terminal.NewProgramStatus(rootCmd.OutOrStdout(), terminal.SupportsProgramStatus(rootCmd.OutOrStdout()))
	ctx = terminal.WithProgramStatus(ctx, status)
	interrupts := make(chan os.Signal, 1)
	signal.Notify(interrupts, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(interrupts)
	done := make(chan struct{})
	defer close(done)
	go func() {
		select {
		case <-interrupts:
			status.Finish("idle", "Cancelled")
			os.Exit(130)
		case <-done:
		}
	}()
	return execute(ctx, rootCmd, prepare)
}

func isUtilityCommand(cmd *cobra.Command) bool {
	for current := cmd; current != nil; current = current.Parent() {
		switch current.Name() {
		case "help", "completion", "__complete", "__completeNoDesc":
			return true
		}
	}
	return false
}

func execute(ctx context.Context, command *cobra.Command, prepare func(*cobra.Command) error) error {
	status := terminal.Status(ctx)
	defer func() {
		if failure := recover(); failure != nil {
			status.Finish("error", fmt.Sprint(failure))
			panic(failure)
		}
	}()
	originalPreRunE := command.PersistentPreRunE
	command.PersistentPreRunE = func(cmd *cobra.Command, args []string) error {
		if originalPreRunE != nil {
			if err := originalPreRunE(cmd, args); err != nil {
				return err
			}
		} else if command.PersistentPreRun != nil {
			command.PersistentPreRun(cmd, args)
		}
		if prepare != nil && !isUtilityCommand(cmd) {
			return prepare(cmd)
		}
		return nil
	}
	defer func() { command.PersistentPreRunE = originalPreRunE }()

	executed, err := command.ExecuteContextC(ctx)
	// Flag and argument failures occur before pre-run hooks. Still leave an
	// error result, respecting plain output and completion suppression.
	if executed != nil {
		plain, _ := executed.Flags().GetBool("plain")
		if plain || isUtilityCommand(executed) {
			status.Disable()
		}
	}
	switch {
	case errors.Is(err, errCancelled), errors.Is(err, surveyterminal.InterruptErr), errors.Is(err, context.Canceled):
		status.Finish("idle", "Cancelled")
	case err != nil:
		status.Finish("error", err.Error())
	default:
		status.Finish("done", "Finished "+executed.CommandPath())
	}
	return err
}
