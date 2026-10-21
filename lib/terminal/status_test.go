package terminal

import (
	"encoding/base64"
	"strings"
	"testing"
)

func TestTruncate(t *testing.T) {
	if got := truncate(strings.Repeat("a", 3000)); len(got) != 2048 {
		t.Fatalf("len = %d, want 2048", len(got))
	}
	if got := truncate("hi"); got != "hi" {
		t.Fatalf("got %q", got)
	}
}

func TestMessageEncoding(t *testing.T) {
	enc := base64.StdEncoding.EncodeToString([]byte("Do you like this photo?"))
	if enc != "RG8geW91IGxpa2UgdGhpcyBwaG90bz8=" {
		t.Fatalf("unexpected encoding %s", enc)
	}
}
