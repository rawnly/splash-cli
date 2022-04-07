package lib

import (
	"bytes"
	"fmt"
	"github.com/mgutz/ansi"
	"io"
	"math"
	"strconv"
	"text/template"
)

type Template struct {
	Data     interface{}
	Template string
}

var templatFuncs = map[string]interface{}{
	"color":    color,
	"dim":      ansi.ColorFunc("white+d"),
	"bold":     ansi.ColorFunc(ansi.DefaultFG + "+b"),
	"bgYellow": ansi.ColorFunc("black+b:yellow"),
	"bgRed":    ansi.ColorFunc("black+b:red"),
	"diff":     func(a interface{}, b interface{}) interface{} { return a.(int32) - b.(int32) },
	"abs":      math.Abs,
}

func NewTemplate(templateString string, name string) (*template.Template, error) {
	return template.
		New(name).
		Funcs(templatFuncs).
		Parse(templateString)
}

func (t Template) Execute(w io.Writer) error {
	temp, err := NewTemplate(t.Template, "")

	if err != nil {
		return err
	}

	return temp.Execute(w, t.Data)
}

func (t Template) String() (string, error) {
	var buf bytes.Buffer

	if err := t.Execute(&buf); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// source: https://github.com/cli/cli/blob/trunk/pkg/export/template.go
func jsonScalarToString(input interface{}) (string, error) {
	switch tt := input.(type) {
	case string:
		return tt, nil
	case float64:
		if math.Trunc(tt) == tt {
			return strconv.FormatFloat(tt, 'f', 0, 64), nil
		} else {
			return strconv.FormatFloat(tt, 'f', 2, 64), nil
		}
	case nil:
		return "", nil
	case bool:
		return fmt.Sprintf("%v", tt), nil
	default:
		return "", fmt.Errorf("cannot convert type to string: %v", tt)
	}
}

func color(colorName string, input interface{}) (string, error) {
	text, err := jsonScalarToString(input)
	if err != nil {
		return "", err
	}
	return ansi.Color(text, colorName), nil
}
