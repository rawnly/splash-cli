package themegenerator_test

import (
	"testing"

	themegenerator "github.com/rawnly/splash-cli/pkg/theme-generator"
)

func TestGetTheme(t *testing.T) {
	platforms := themegenerator.PlatformValues()

	for _, platform := range platforms {
		_, e := themegenerator.GetTheme("../../test-assets/demo.jpeg", themegenerator.Platform(platform))

		if e != nil {
			t.Fatal(e.Error())
		}
	}
}

// func TestParsePhotoIDFromURL(t *testing.T) {
// 	for i, tCase := range photoUrls {
// 		result := lib.ParsePhotoIDFromURL(tCase.data)
//
// 		if result != tCase.expected {
// 			t.Errorf("[%d] Expected \"%s\" received \"%s\"", i, tCase.expected, parseResult(result))
// 		}
// 	}
// }
//
