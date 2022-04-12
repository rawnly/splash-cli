package lib

import (
	"github.com/spf13/cobra"
	"reflect"
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

func InheritFlags[T any](flags T, cmd *cobra.Command) {
	t := reflect.TypeOf(flags)
	v := reflect.ValueOf(flags)

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldName := field.Tag.Get("json")
		shorthand := field.Tag.Get("short")
		desc := field.Tag.Get("description")
		defaultValue := ParseStringValue(field.Tag.Get("default"))

		if defaultValue == "" {
			defaultValue = v.Field(i)
		}

		switch field.Type.Kind() {
		case reflect.String:
			cmd.Flags().StringP(fieldName, shorthand, v.Field(i).String(), desc)
			break
		case reflect.Int:
		case reflect.Int8:
		case reflect.Int32:
		case reflect.Int64:
			if defaultValue != "" {
				cmd.Flags().Int64P(fieldName, shorthand, v.Field(i).Int(), desc)
			} else {
				cmd.Flags().Int64P(fieldName, shorthand, 0, desc)
			}
			break
		case reflect.Bool:
			if defaultValue != "" {
				cmd.Flags().BoolP(fieldName, shorthand, v.Field(i).Bool(), desc)
			} else {
				cmd.Flags().BoolP(fieldName, shorthand, false, desc)
			}
			break
		}
	}
}
