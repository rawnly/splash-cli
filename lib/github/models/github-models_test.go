package models

import "testing"

func TestVersionFromString(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    Version
		wantErr bool
	}{
		{
			name:  "plain semver",
			input: "4.1.4",
			want:  Version{Major: 4, Minor: 1, Patch: 4},
		},
		{
			name:  "tagged semver",
			input: "v4.1.4",
			want:  Version{Major: 4, Minor: 1, Patch: 4},
		},
		{
			name:  "prerelease",
			input: "v4.1.5-beta.1",
			want:  Version{Major: 4, Minor: 1, Patch: 5},
		},
		{
			name:  "build metadata",
			input: "v4.1.5+20260523",
			want:  Version{Major: 4, Minor: 1, Patch: 5},
		},
		{
			name:    "invalid",
			input:   "v4.1",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := VersionFromString(tt.input)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error")
				}
				return
			}

			if err != nil {
				t.Fatalf("VersionFromString() error = %v", err)
			}

			if *got != tt.want {
				t.Fatalf("VersionFromString() = %+v, want %+v", *got, tt.want)
			}
		})
	}
}
