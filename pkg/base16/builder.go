package base16

import (
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/rawnly/splash-cli/lib"
)

var ghosttyTemplate = heredoc.Doc(`
## author: Splash CLI

background = {{ .Base00 }}
foreground= {{ .Base07 }}

selection-foreground= {{ .Base00 }}
selection-background = {{ .Base07 }}


# black
palette = 0={{ .Base00 }}
palette = 8={{ .Base08 }}
# red
palette = 1={{ .Base01 }}
palette = 9={{ .Base09 }}
# green
palette = 2={{ .Base02 }}
palette = 10={{ .Base10 }}
# yellow
palette = 3={{ .Base03 }}
palette = 11={{ .Base11 }}
# blue
palette = 4={{ .Base04 }}
palette = 12={{ .Base12 }}
# purple
palette = 5={{ .Base05 }}
palette = 13={{ .Base13 }}
# aqua
palette = 6={{ .Base06 }}
palette = 14={{ .Base14 }}
# white
palette = 7={{ .Base07 }}
palette = 15={{ .Base15 }}
`)

var weztermTemplate = heredoc.Doc(`
[colors]
# Standard colors
base00 = "{{ .Base00 }}" # 0 - Background
base01 = "{{ .Base01 }}" # 1
base02 = "{{ .Base02 }}" # 2
base03 = "{{ .Base03 }}" # 3
base04 = "{{ .Base04 }}" # 4
base05 = "{{ .Base05 }}" # 5 - Default text / foreground
base06 = "{{ .Base06 }}" # 6
base07 = "{{ .Base07 }}" # 7
base08 = "{{ .Base08 }}" # 8 - Red / errors
base09 = "{{ .Base09 }}" # 9 - Orange / warnings
base10 = "{{ .Base10 }}" # 10 - Yellow / highlights
base11 = "{{ .Base11 }}" # 11 - Green / success
base12 = "{{ .Base12 }}" # 12 - Cyan / accents
base13 = "{{ .Base13 }}" # 13 - Blue / keywords
base14 = "{{ .Base14 }}" # 14 - Magenta / constants
base15 = "{{ .Base15 }}" # 15 - Brightest / white

[colors.mapping]
foreground = "{base07}"
background = "{base00}"
cursor_bg = "{base07}"
cursor_fg = "{base00}"
cursor_border = "{base07}"
selection_bg = "{base07}"
selection_fg = "{base00}"

ansi = [
  "{base00}", # 0
  "{base08}", # 1
  "{base11}", # 2
  "{base10}", # 3
  "{base13}", # 4
  "{base14}", # 5
  "{base12}", # 6
  "{base05}", # 7
]

brights = [
  "{base03}", # 8
  "{base08}", # 9
  "{base11}", # 10
  "{base10}", # 11
  "{base13}", # 12
  "{base14}", # 13
  "{base12}", # 14
  "{base07}", # 15
]
`)

var kittyTemplate = heredoc.Doc(`
# 0–7: Normal colors
color0  {{ .Base00 }}  # base00 - Background
color1  {{ .Base01 }}  # base01
color2  {{ .Base02 }}  # base02
color3  {{ .Base03 }}  # base03
color4  {{ .Base04 }}  # base04
color5  {{ .Base05 }}  # base05
color6  {{ .Base06 }}  # base06
color7  {{ .Base07 }}  # base07

# 8–15: Bright colors
color8  {{ .Base08 }}  # base08
color9  {{ .Base09 }}  # base09
color10 {{ .Base10 }}  # base10
color11 {{ .Base11 }}  # base11
color12 {{ .Base12 }}  # base12
color13 {{ .Base13 }}  # base13
color14 {{ .Base14 }}  # base14
color15 {{ .Base15 }}  # base15

# UI colors
background            {{ .Base00 }}
foreground            {{ .Base05 }}
cursor                {{ .Base05 }}
selection_background  {{ .Base02 }}
selection_foreground  {{ .Base05 }}
url_color             {{ .Base08 }}
active_border_color   {{ .Base05 }}
inactive_border_color {{ .Base02 }}
active_tab_foreground {{ .Base07 }}
active_tab_background {{ .Base00 }}
inactive_tab_foreground {{ .Base04 }}
inactive_tab_background {{ .Base01 }}
`)

var itermTemplate = heredoc.Doc(`
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- Normal colors -->
  <key>Ansi 0 Color</key>  <dict>{{ itermRGB .Base00 }}</dict>
  <key>Ansi 1 Color</key>  <dict>{{ itermRGB .Base08 }}</dict>
  <key>Ansi 2 Color</key>  <dict>{{ itermRGB .Base11 }}</dict>
  <key>Ansi 3 Color</key>  <dict>{{ itermRGB .Base10 }}</dict>
  <key>Ansi 4 Color</key>  <dict>{{ itermRGB .Base13 }}</dict>
  <key>Ansi 5 Color</key>  <dict>{{ itermRGB .Base14 }}</dict>
  <key>Ansi 6 Color</key>  <dict>{{ itermRGB .Base12 }}</dict>
  <key>Ansi 7 Color</key>  <dict>{{ itermRGB .Base05 }}</dict>

  <!-- Bright colors -->
  <key>Ansi 8 Color</key>  <dict>{{ itermRGB .Base03 }}</dict>
  <key>Ansi 9 Color</key>  <dict>{{ itermRGB .Base08 }}</dict>
  <key>Ansi 10 Color</key> <dict>{{ itermRGB .Base11 }}</dict>
  <key>Ansi 11 Color</key> <dict>{{ itermRGB .Base10 }}</dict>
  <key>Ansi 12 Color</key> <dict>{{ itermRGB .Base13 }}</dict>
  <key>Ansi 13 Color</key> <dict>{{ itermRGB .Base14 }}</dict>
  <key>Ansi 14 Color</key> <dict>{{ itermRGB .Base12 }}</dict>
  <key>Ansi 15 Color</key> <dict>{{ itermRGB .Base07 }}</dict>

  <!-- UI colors -->
  <key>Background Color</key>          <dict>{{ itermRGB .Base00 }}</dict>
  <key>Foreground Color</key>          <dict>{{ itermRGB .Base05 }}</dict>
  <key>Cursor Color</key>              <dict>{{ itermRGB .Base05 }}</dict>
  <key>Cursor Text Color</key>         <dict>{{ itermRGB .Base00 }}</dict>
  <key>Selection Color</key>           <dict>{{ itermRGB .Base02 }}</dict>
  <key>Selected Text Color</key>       <dict>{{ itermRGB .Base05 }}</dict>
  <key>Bold Color</key>                <dict>{{ itermRGB .Base07 }}</dict>
</dict>
</plist>
`)

type Platform string

func (t *Platform) Values() []string {
	return []string{
		string(PlatformGhostty),
		string(PlatfromIterm),
		string(PlatformKitty),
		string(PlatformWezterm),
		string(PlatformAlacritty),
	}
}

func (t *Platform) String() string {
	return string(*t)
}

func (t *Platform) Type() string {
	return "Theme"
}

func (t *Platform) Set(v string) error {
	switch v {
	case string(PlatformGhostty), string(PlatfromIterm), string(PlatformKitty), string(PlatformWezterm), string(PlatformAlacritty):
		*t = Platform(v)
		return nil
	}

	return fmt.Errorf("invalid platform: %s. Must be one of %v", v, t.Values())
}

func ThemeFromString(s string) (*Platform, error) {
	var t Platform

	switch s {
	case "ghostty":
		t = PlatformGhostty
	case "wezterm":
		t = PlatformWezterm
	case "kitty":
		t = PlatformKitty
	case "iterm":
		t = PlatfromIterm
	}

	if t == "" {
		return nil, fmt.Errorf("invalid platform: %s, must be one of: %v", s, t.Values())
	}

	return &t, nil
}

const (
	PlatformGhostty   Platform = "ghostty"
	PlatformKitty     Platform = "kitty"
	PlatfromIterm     Platform = "iterm"
	PlatformWezterm   Platform = "wezterm"
	PlatformAlacritty Platform = "alacritty"
)

func GetTheme(imagePath string, theme Platform) (string, error) {
	scheme, _, err := GetScheme(imagePath)
	if err != nil {
		return "", err
	}

	templates := map[Platform]string{
		PlatformGhostty: ghosttyTemplate,
		PlatfromIterm:   itermTemplate,
		PlatformKitty:   kittyTemplate,
		PlatformWezterm: weztermTemplate,
	}

	template, ok := templates[theme]
	if !ok {
		return "", fmt.Errorf("unsupported platform: %v", theme)
	}

	thm, err := lib.StringTemplate(template, scheme)
	if err != nil {
		return "", err
	}

	return thm, nil
}
