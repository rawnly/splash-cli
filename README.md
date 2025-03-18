# Splash CLI 
A simple, CLI to download Unsplash wallpapers. Nothing fancy — it just works.

<center>
 <img src="https://github.com/user-attachments/assets/fb30ee98-d73e-4709-9a97-819a34bd78a6" />
</center>


## 💿 Installation

#### Via Homebrew
```shell
brew tap rawnly/tap
brew install splash-cli
```

You can now run `splash` and have fun!

#### Via Go 
```shell
go install github.com/rawnly/splash-cli@latest
```

Be sure to set up your environment before running the command.

Required environment variables are:
 - `UNSPLASH_CLIENT_ID`
 - `UNSPLASH_CLIENT_SECRET`

You can get credentials on the [Unsplash Developer Portal](https://unsplash.com/developers).

> [!TIP]
> Remember that the binary name is `splash-cli` and not `splash` when installing via go

#### Manual installation
- Download the [latest pre-release](https://github.com/splash-cli/splash-cli/releases)
- Move the binary to your `$PATH`
- Enjoy


## 💻 Usage
```
Get a photo

Usage:
  splash [flags]
  splash [command]

Examples:
$ splash --day
$ splash --query "mountains" --orientation "landscape"


Available Commands:
  alias       Manage collection aliases
  auth        Authenticate with Unsplash
  collection  CRUD on collections
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  settings    Manage user settings

Flags:
  -c, --collections strings   Public collection ID(s) to filter selection. If multiple, comma-separated
      --day                   Retrieve the photo of the day
  -h, --help                  help for splash
      --id string             Retrieve a single photo by ID
      --no-cache              Ignore cache
  -o, --orientation string    Filter by photo orientation (default "landscape")
      --plain                 Plain output. Good for tty
  -q, --query string          Limit selection to photos matching a search term.
  -s, --save                  Save the photo without setting it as wallpaper
      --scale string          Set wallpaper scale (default "auto")
      --screen int            Set wallpaper on a specific screen. (macos only) (default -1)
  -t, --topics strings        Public topic ID(s) to filter selection. If multiple, comma-separated
  -u, --user string           Limit selection to a single user.
  -v, --version               version for splash

Use "splash [command] --help" for more information about a command.
```

## 🧰 Build Locally
To build the project locally you can use the following command:

```shell
    goreleaser --snapshot --rm-dist
    
    # Or
    
    make build # this will only build for the current platform
```
> **Note**
> If you have an `.env` file in your project root `make` will automatically inject values inside script commands.
