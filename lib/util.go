package lib

import (
	"strconv"
)

func ParseStringValue(value string) any {
	if value == "true" || value == "false" {
		val, err := strconv.ParseBool(value)

		if err != nil {
			return false
		}

		return val
	}

	val, err := strconv.Atoi(value)

	if err != nil {
		return value
	}

	return val
}
