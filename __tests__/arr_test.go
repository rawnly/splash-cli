package __tests__

import (
	"github.com/rawnly/splash-cli/lib/slice"
	"testing"
)

var sliceInt = []int{-3, -2, -1, 0, 1, 2, 3}
var positiveSlice = []int{1, 2, 3}

func TestSomeSlice(t *testing.T) {
	s := slice.Some(sliceInt, func(item int) bool {
		return item == 0
	})

	if !s {
		t.Errorf("Expected \"true\". Received %t", s)
	}
}

func TestEverySlice(t *testing.T) {
	s := slice.Every(positiveSlice, func(item int) bool {
		return item > 0
	})

	if !s {
		t.Errorf("Expected \"true\". Received %t", s)
	}
}

func TestFilterSlice(t *testing.T) {
	filterNonZero := func(item int) bool {
		return item > 0
	}

	var filtered []int = slice.Filter(sliceInt, filterNonZero)

	if len(filtered) != 3 {
		t.Errorf("Expected 3 items. Received %d", len(filtered))
	}
}

func TestMapSlice(t *testing.T) {
	var m []int = slice.Map(positiveSlice, func(n int) int {
		return n + 1
	})

	expectedMapped := []int{2, 3, 4}

	for i, k := range expectedMapped {
		if k != m[i] {
			t.Errorf("Expected %d. Received %d", k, m[i])
		}
	}
}

func TestReduceSlice(t *testing.T) {
	var m int = slice.Reduce(0, positiveSlice, func(acc int, curr int, idx int) int {
		return acc + curr
	})

	if m != 6 {
		t.Errorf("Expected 6. Received %d", m)
	}
}
