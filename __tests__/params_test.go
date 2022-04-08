package __tests__

import (
	"github.com/rawnly/splash-cli/unsplash"
	"net/url"
	"testing"
)

type params struct {
	Page    int      `url:"page"`
	PerPage int      `url:"per_page"`
	Query   string   `url:"q"`
	Scope   []string `url:"scope" separator:"comma"`
}

func TestStringify(t *testing.T) {
	p := params{
		Page:    1,
		PerPage: 10,
		Query:   "test spacing",
		Scope:   []string{"public", "user"},
	}

	expected := url.PathEscape("page=1&per_page=10&q=test spacing&scope=public,user")

	if unsplash.Stringify(p) != expected {
		t.Errorf("Expected %s, got %s", expected, unsplash.Stringify(p))
	}
}
