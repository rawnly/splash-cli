package lib

import (
	"bytes"
	"fmt"
	"io"
	"math"
	"strconv"
	"text/template"

	"github.com/lucasb-eyer/go-colorful"
	"github.com/mgutz/ansi"
)

type Template struct {
	Data     interface{}
	Template string
}

var templateFunctions = map[string]interface{}{
	"color":        color,
	"underline":    ansi.ColorFunc("default+u"),
	"dim":          ansi.ColorFunc("default+d"),
	"bold":         ansi.ColorFunc("default+b"),
	"bgYellow":     ansi.ColorFunc("black+b:yellow"),
	"bgRed":        ansi.ColorFunc("black+b:red"),
	"diff":         func(a interface{}, b interface{}) interface{} { return a.(int32) - b.(int32) },
	"abs":          math.Abs,
	"formatNumber": formatNumber,
	"itermRGB":     itermRGB,
}

func itermRGB(hex string) string {
	c, _ := colorful.Hex(hex)

	return fmt.Sprintf(
		`<key>Red Component</key><real>%.6f</real>
<key>Green Component</key><real>%.6f</real>
<key>Blue Component</key><real>%.6f</real>`,
		c.R, c.G, c.B,
	)
}

func NewTemplate(templateString string, name string) (*template.Template, error) {
	return template.
		New(name).
		Funcs(templateFunctions).
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

func StringTemplate(text string, data interface{}) (string, error) {
	return Template{
		Data:     data,
		Template: text,
	}.String()
}

func formatNumber(n int) string {
	if n < 1000 {
		return fmt.Sprintf("%d", n)
	}
	if n < 1000000 {
		return fmt.Sprintf("%.1fK", float64(n)/1000)
	}
	if n < 1000000000 {
		return fmt.Sprintf("%.1fM", float64(n)/1000000)
	}

	return fmt.Sprintf("%.1fG", float64(n)/1000000000)
}
