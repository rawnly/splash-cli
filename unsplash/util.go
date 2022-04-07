package unsplash

import (
	"io"
	"net/http"
	"os"
)

// DownloadPhoto / Download a file from a URL and returns the path as string
func DownloadPhoto(url string, filename string) (string, error) {
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
