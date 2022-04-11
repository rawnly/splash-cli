package lib

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

func HomeFile(file string) (string, error) {
	homedir, err := os.UserHomeDir()

	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s/%s", homedir, file), nil
}

func FileExists(filename string) bool {
	_, err := os.Stat(filename)

	if err == nil {
		return true
	}

	return false
}

// DownloadFile / Download a file from a URL and returns the path as string
func DownloadFile(url string, filename string) (string, error) {
	// Create the file
	out, err := os.Create(filename)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		return "", err
	}

	return filename, nil
}
