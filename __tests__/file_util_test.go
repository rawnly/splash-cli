package __tests__

import (
	"os"
	"testing"
)
import "strings"
import "github.com/rawnly/splash-cli/lib"

func TestHomePath(t *testing.T) {
	path, err := lib.HomePath("~/Desktop")

	if err != nil {
		t.Error(err)
	}

	if strings.Contains(path, "~") {
		t.Errorf("Expected to not contain tilde.")
	}
}

func TestHomePath_ShouldInsertHomePathIfNoAbsolute(t *testing.T) {
	path, err := lib.HomePath("Pictures/splash_photos")

	if err != nil {
		t.Error(err)
	}

	home, err := os.UserHomeDir()

	if err != nil {
		t.Error(err)
	}

	if !strings.Contains(path, home) {
		t.Errorf("It should include home if the path is not absolute.")
	}
}
