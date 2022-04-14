package lib

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
)

// Adds $HOME before the path if it is not absolute
func HomePrefix(path string) (string, error) {
	if len(path) > 0 && path[0] == '/' {
		return path, nil
	}

	re, err := regexp.Compile("^~?")
	if err != nil {
		return "", err
	}

	path = re.ReplaceAllString(path, "")

	homedir, err := os.UserHomeDir()

	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s/%s", homedir, path), nil
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
