package lib

import (
	"os"
	"testing"
)

func TestFileExists(t *testing.T) {
	// 1. create a temporary file
	tmpFile, err := os.CreateTemp("", "testfile")
	if err != nil {
		t.Fatalf("Failed to create temp file: %v", err)
	}

	defer os.Remove(tmpFile.Name()) // clean up

	// 2. test that FileExists returns true for the existing file
	if !FileExists(tmpFile.Name()) {
		t.Errorf("FileExists returned false for an existing file: %s", tmpFile.Name())
	}

	// 3. test that FileExists returns false for a non-existing file
	nonExistentFile := tmpFile.Name() + "_nonexistent"
	if FileExists(nonExistentFile) {
		t.Errorf("FileExists returned true for a non-existing file: %s", nonExistentFile)
	}
}
