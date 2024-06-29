package env

import (
	"os"
	"strconv"
)

// String returns the value of the environment variable named by the key
//
// # If the environment variable is empty and no defaultValue is provided, it panics
//
// Example:
//
//	port := env.String("PORT", "8080")
//	port := env.String("PORT")
func String(key string, defaultValue ...string) string {
	if value, ok := os.LookupEnv(key); ok {
		if value != "" {
			return value
		}
	}

	if len(defaultValue) > 0 {
		return defaultValue[0]
	}

	panic("Missing env variable: '" + key + "'")
}

// Int64 returns the value of the environment variable named by the key
//
// # If the environment variable is empty and no defaultValue is provided, it panics
//
// Example:
//
//	port := env.String("PORT", "8080")
//	port := env.String("PORT")
func Int64(key string, defaultValue ...int64) int64 {
	if value, ok := os.LookupEnv(key); ok {
		if i, ok := strconv.ParseInt(value, 10, 64); ok == nil {
			return i
		}

		panic("Invalid value for env variable: '" + key + "'")
	}

	if len(defaultValue) > 0 {
		return defaultValue[0]
	}

	panic("Missing env variable: '" + key + "'")
}

// Int64 returns the value of the environment variable named by the key
//
// # If the environment variable is empty and no defaultValue is provided, it panics
//
// Example:
//
//	port := env.String("PORT", "8080")
//	port := env.String("PORT")
func Bool(key string, defaultValue ...bool) bool {
	if value, ok := os.LookupEnv(key); ok {
		if i, ok := strconv.ParseBool(value); ok == nil {
			return i
		}

		panic("Invalid value for env variable: '" + key + "'")
	}

	if len(defaultValue) > 0 {
		return defaultValue[0]
	}

	panic("Missing env variable: '" + key + "'")
}
