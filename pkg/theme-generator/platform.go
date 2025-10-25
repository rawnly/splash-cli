package themegenerator

import "fmt"

type Platform string

const (
	PlatformGhostty Platform = "ghostty"
	PlatformKitty   Platform = "kitty"
	PlatformIterm   Platform = "iterm"
	PlatformWezterm Platform = "wezterm"
)

func PlatformValues() []string {
	return []string{
		string(PlatformGhostty),
		string(PlatformIterm),
		string(PlatformKitty),
		string(PlatformWezterm),
	}
}

func (p *Platform) Values() []string {
	return PlatformValues()
}

func (p *Platform) String() string {
	return string(*p)
}

func (p *Platform) Type() string {
	return "Platform"
}

func (p *Platform) Set(v string) error {
	switch v {
	case string(PlatformGhostty), string(PlatformIterm), string(PlatformKitty), string(PlatformWezterm):
		*p = Platform(v)
		return nil
	}

	return fmt.Errorf("invalid platform: %s. Must be one of %v", v, p.Values())
}
