package slice

func Map[T any, U any](slice []T, f func(T) U) []U {
	var mapped []U

	for _, k := range slice {
		mapped = append(mapped, f(k))
	}

	return mapped
}
