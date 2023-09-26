package __tests__

import (
	"fmt"
	"testing"

	"github.com/rawnly/splash-cli/lib/expressions"
)

const (
	collectionURL = "https://unsplash.com/collections/3644553/stockpapers"
	photoURL      = "https://unsplash.com/photos/a-valley-with-a-river-running-through-it-6NAbqcv3fpg"
)

func TestIsPhotoUrl(t *testing.T) {
	if expressions.IsPhotoUrl(photoURL) == false {
		t.Errorf("Expected true. Received false")
	}
}

func TestIsCollectionUrl(t *testing.T) {
	if expressions.IsCollectionUrl(collectionURL) == false {
		t.Errorf("Expected true. Received false")
	}
}

func TestExtractPhotoID(t *testing.T) {
	id := expressions.ExtractPhotoId(photoURL)
	expected := "6NAbqcv3fpg"

	if id != expected {
		t.Errorf("Expected %s, Received %s", expected, id)
	}

	fmt.Println(id)
}

func TestExtractCollectionID(t *testing.T) {
	id, name := expressions.ExtractCollectionId(collectionURL)

	expectedId := "3644553"
	expectedName := "stockpapers"

	if id != expectedId {
		t.Errorf("[ID] Expected %s, Received %s", expectedId, id)
	}

	if name != expectedName {
		t.Errorf("[NAME] Expected %s, Received %s", expectedName, name)
	}
}
