package __tests__

import (
	"github.com/rawnly/splash-cli/lib"
	"testing"
)

func TestParseStringValue(t *testing.T) {
	data := map[string]any{
		"string": "string",
		"true":   true,
		"false":  false,
		"123":    123,
	}

	for key, value := range data {
		result := lib.ParseStringValue(key)

		if result != value {
			t.Errorf("Expected %v, got %v", value, result)
		}
	}
}
