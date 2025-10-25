package themegenerator

import (
	"fmt"

	"github.com/MakeNowJust/heredoc"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/pkg/base16"
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
palette = 10={{ .Base0A }}
# yellow
palette = 3={{ .Base03 }}
palette = 11={{ .Base0B }}
# blue
palette = 4={{ .Base04 }}
palette = 12={{ .Base0C }}
# purple
palette = 5={{ .Base05 }}
palette = 13={{ .Base0D }}
# aqua
palette = 6={{ .Base06 }}
palette = 14={{ .Base0E }}
# white
palette = 7={{ .Base07 }}
palette = 15={{ .Base0F }}
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
base10 = "{{ .Base0A }}" # 10 - Yellow / highlights
base11 = "{{ .Base0B }}" # 11 - Green / success
base12 = "{{ .Base0C }}" # 12 - Cyan / accents
base13 = "{{ .Base0D }}" # 13 - Blue / keywords
base14 = "{{ .Base0E }}" # 14 - Magenta / constants
base15 = "{{ .Base0F }}" # 15 - Brightest / white

[colors.mapping]
foreground = "{{ .Base07 }}"
background = "{{ .Base00 }}"
cursor_bg = "{{ .Base07 }}"
cursor_fg = "{{ .Base00 }}"
cursor_border = "{{ .Base07 }}"
selection_bg = "{{ .Base07 }}"
selection_fg = "{{ .Base00 }}"

ansi = [
  "{{ .Base00 }}", # 0
  "{{ .Base08 }}", # 1
  "{{ .Base0B }}", # 2
  "{{ .Base0A }}", # 3
  "{{ .Base0D }}", # 4
  "{{ .Base0E }}", # 5
  "{{ .Base0C }}", # 6
  "{{ .Base05 }}", # 7
]

brights = [
  "{base03}", # 8
  "{base08}", # 9
  "{base0B}", # 10
  "{base0A}", # 11
  "{base0D}", # 12
  "{base0E}", # 13
  "{base0C}", # 14
  "{base0F}", # 15
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
color10 {{ .Base0A }}  # base10
color11 {{ .Base0B }}  # base11
color12 {{ .Base0C }}  # base12
color13 {{ .Base0D }}  # base13
color14 {{ .Base0E }}  # base14
color15 {{ .Base0F }}  # base15

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
  <key>Ansi 2 Color</key>  <dict>{{ itermRGB .Base0B }}</dict>
  <key>Ansi 3 Color</key>  <dict>{{ itermRGB .Base0A }}</dict>
  <key>Ansi 4 Color</key>  <dict>{{ itermRGB .Base0D }}</dict>
  <key>Ansi 5 Color</key>  <dict>{{ itermRGB .Base0E }}</dict>
  <key>Ansi 6 Color</key>  <dict>{{ itermRGB .Base0C }}</dict>
  <key>Ansi 7 Color</key>  <dict>{{ itermRGB .Base05 }}</dict>

  <!-- Bright colors -->
  <key>Ansi 8 Color</key>  <dict>{{ itermRGB .Base03 }}</dict>
  <key>Ansi 9 Color</key>  <dict>{{ itermRGB .Base08 }}</dict>
  <key>Ansi 10 Color</key> <dict>{{ itermRGB .Base0B }}</dict>
  <key>Ansi 11 Color</key> <dict>{{ itermRGB .Base0A }}</dict>
  <key>Ansi 12 Color</key> <dict>{{ itermRGB .Base0D }}</dict>
  <key>Ansi 13 Color</key> <dict>{{ itermRGB .Base0E }}</dict>
  <key>Ansi 14 Color</key> <dict>{{ itermRGB .Base0C }}</dict>
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

func GetTheme(imagePath string, theme Platform) (string, error) {
	scheme, _, err := base16.GetSchemeFromImage(imagePath)
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
