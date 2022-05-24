package slice

func Map[T any, U any](slice []T, f func(T) U) []U {
	var mapped []U

	for _, k := range slice {
		mapped = append(mapped, f(k))
	}

	return mapped
}

func Filter[T any](slice []T, f func(T) bool) []T {
	var filtered []T

	for _, k := range slice {
		if !f(k) {
			continue
		}

		filtered = append(filtered, k)
	}

	return filtered
}

func Reduce[T any, U any](initial U, slice []T, f func(acc U, curr T, idx int) U) U {
	for idx, k := range slice {
		initial = f(initial, k, idx)
	}

	return initial
}

func Some[T any](slice []T, f func(T) bool) bool {
	for _, k := range slice {
		if f(k) {
			return true
		}
	}

	return false
}

func Every[T any](slice []T, f func(T) bool) bool {
	t := false

	for _, k := range slice {
		t = f(k)
	}

	return t
}
