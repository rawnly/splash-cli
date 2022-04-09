package network

import (
	"fmt"
	"net/url"
	"reflect"
	"strconv"
	"strings"
)

func Stringify[T any](p T) string {
	t := reflect.TypeOf(p)
	v := reflect.ValueOf(p)
	result := ""

	for i := 0; i < t.NumField(); i++ {
		value := v.Field(i)
		field := t.Field(i)
		tag := field.Tag

		if len(tag) == 0 {
			continue
		}

		joinChar := ""
		var val string

		if result != "" {
			joinChar = "&"
		}

		switch field.Type.Kind() {
		case reflect.Slice:
			var separator string

			switch tag.Get("separator") {
			case "space":
				separator = " "
			default:
				separator = ","
			}

			val = strings.Join(value.Interface().([]string), separator)
		case reflect.Int:
			val = strconv.FormatInt(value.Int(), 10)

			if value.IsZero() {
				val = tag.Get("default")
			}

			if val == "" {
				val = "0"
			}
		default:
			val = value.String()

			if val == "" {
				val = tag.Get("default")
			}
		}

		if len(val) > 0 {
			result += fmt.Sprintf("%s%s=%s", joinChar, tag.Get("url"), val)
		}
	}

	return url.PathEscape(result)
}
