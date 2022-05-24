package __tests__

import (
	"fmt"
	"github.com/rawnly/splash-cli/lib"
	"testing"
)

type testCase struct {
	expected string
	data     string
}

var photoUrls []testCase = []testCase{
	{
		expected: "fPbLnMMd8BU",
		data:     "https://unsplash.com/photos/fPbLnMMd8BU",
	},
	{
		expected: "fPbLnMMd8BU",
		data:     "https://unsplash.com/photos/fPbLnMMd8BU/",
	},
	{
		expected: "fPbLnMMd8BU",
		data:     "unsplash.com/photos/fPbLnMMd8BU/",
	},
}

var collectionUrlsForParsing []testCase = []testCase{
	{
		expected: "8791381|aerial-beaches",
		data:     "https://unsplash.com/collections/8791381/aerial-beaches",
	},
	{
		expected: "8791381|aerial-beaches",
		data:     "https://unsplash.com/collections/8791381/aerial-beaches/",
	},
	{
		expected: "8791381|aerial-beaches",
		data:     "unsplash.com/collections/8791381/aerial-beaches/",
	},
}

func parseResult(s string) string {
	switch s {
	case "":
		return "EMPTY_STRING"
	default:
		return s
	}
}

func TestParsePhotoIDFromUrl(t *testing.T) {
	for i, tCase := range photoUrls {
		result := lib.ParsePhotoIDFromUrl(tCase.data)

		if result != tCase.expected {
			t.Errorf("[%d] Expected \"%s\" received \"%s\"", i, tCase.expected, parseResult(result))
		}
	}
}

func TestParseCollectionIDFromUrl(t *testing.T) {
	for i, tCase := range collectionUrlsForParsing {
		id, name := lib.ParseCollectionFromUrl(tCase.data)

		result := fmt.Sprintf("%s|%s", id, name)

		if result != tCase.expected {
			t.Errorf("[%d] Expected \"%s\" received \"%s\"", i, tCase.expected, parseResult(result))
		}
	}
}

//var urls = []string{
//	"https://unsplash.com",
//	"https://unsplash.com/collections/8791381/aerial-beaches",
//	"https://unsplash.com/photos/fPbLnMMd8BU",
//}
//
//func TestIsUnsplashUrl(t *testing.T) {
//	for _, url := range urls {
//		//result := lib.IsUnsplashUrl(url)
//
//		re, err := regexp.Compile(`unsplash\\.com`)
//		if err != nil {
//			t.Fail()
//		}
//
//		if !re.MatchString(url) {
//			t.Errorf("Expected %s to contain \"unsplash.com\"", url)
//		}
//	}
//}
//
//var collectionUrls = []string{
//	"https://unsplash.com/collections/8240068/mute-and-pastel",
//	"https://unsplash.com/collections/4474589/mockups",
//	"https://unsplash.com/collections/44204348/medium-frames-in-interior",
//}
//
//func TestIsUnsplashCollectionUrl(t *testing.T) {
//	for _, url := range collectionUrls {
//		result := lib.IsUnsplashCollectionUrl(url)
//
//		if result {
//			t.Fail()
//		}
//	}
//}
