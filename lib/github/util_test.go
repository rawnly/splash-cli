package github

import (
	"errors"
	"testing"

	"github.com/rawnly/splash-cli/config"
	"github.com/rawnly/splash-cli/lib/github/models"
)

func TestIsOutdated(t *testing.T) {
	tests := []struct {
		name    string
		current string
		latest  string
		want    bool
	}{
		{
			name:    "older version",
			current: "4.1.4",
			latest:  "v4.1.5",
			want:    true,
		},
		{
			name:    "latest version without v prefix",
			current: "v4.1.4",
			latest:  "4.1.5",
			want:    true,
		},
		{
			name:    "same version",
			current: "4.1.4",
			latest:  "v4.1.4",
			want:    false,
		},
		{
			name:    "newer local version",
			current: "4.1.5",
			latest:  "v4.1.4",
			want:    false,
		},
		{
			name:    "development version",
			current: "4.1.5-dev",
			latest:  "v4.1.6",
			want:    false,
		},
		{
			name:    "invalid latest version",
			current: "4.1.5",
			latest:  "not-a-version",
			want:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := isOutdated(tt.current, tt.latest); got != tt.want {
				t.Fatalf("isOutdated() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNeedsToUpdate(t *testing.T) {
	originalVersion := config.Version
	originalGetLatestVersion := getLatestVersion

	t.Cleanup(func() {
		config.Version = originalVersion
		getLatestVersion = originalGetLatestVersion
	})

	t.Run("skips development builds", func(t *testing.T) {
		config.Version = "dev"
		getLatestVersion = func() (*models.Version, string, error) {
			t.Fatal("getLatestVersion should not be called")
			return nil, "", nil
		}

		update, version, err := NeedsToUpdate()
		if err != nil {
			t.Fatalf("NeedsToUpdate() error = %v", err)
		}

		if update || version != nil {
			t.Fatalf("NeedsToUpdate() = %v, %+v; want false, nil", update, version)
		}
	})

	t.Run("returns update for newer release", func(t *testing.T) {
		config.Version = "4.1.4"
		getLatestVersion = func() (*models.Version, string, error) {
			return &models.Version{Major: 4, Minor: 1, Patch: 5}, "v4.1.5", nil
		}

		update, version, err := NeedsToUpdate()
		if err != nil {
			t.Fatalf("NeedsToUpdate() error = %v", err)
		}

		if !update {
			t.Fatal("NeedsToUpdate() update = false, want true")
		}

		if version == nil || version.String() != "4.1.5" {
			t.Fatalf("NeedsToUpdate() version = %+v, want 4.1.5", version)
		}
	})

	t.Run("returns fetch errors", func(t *testing.T) {
		config.Version = "4.1.4"
		wantErr := errors.New("release fetch failed")
		getLatestVersion = func() (*models.Version, string, error) {
			return nil, "", wantErr
		}

		update, version, err := NeedsToUpdate()
		if !errors.Is(err, wantErr) {
			t.Fatalf("NeedsToUpdate() error = %v, want %v", err, wantErr)
		}

		if update || version != nil {
			t.Fatalf("NeedsToUpdate() = %v, %+v; want false, nil", update, version)
		}
	})
}
