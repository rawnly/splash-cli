package base16

import (
	"encoding/json"
	"image"
	"os"
	"sort"

	_ "image/jpeg"
	_ "image/png"

	"github.com/cenkalti/dominantcolor"
	"github.com/lucasb-eyer/go-colorful"
)

type Scheme struct {
	Base00 string `json:"base00"`
	Base01 string `json:"base01"`
	Base02 string `json:"base02"`
	Base03 string `json:"base03"`
	Base04 string `json:"base04"`
	Base05 string `json:"base05"`
	Base06 string `json:"base06"`
	Base07 string `json:"base07"`
	Base08 string `json:"base08"`
	Base09 string `json:"base09"`
	Base10 string `json:"base10"`
	Base11 string `json:"base11"`
	Base12 string `json:"base12"`
	Base13 string `json:"base13"`
	Base14 string `json:"base14"`
	Base15 string `json:"base15"`
}

func buildScheme(cols []colorful.Color) Scheme {
	return Scheme{
		Base00: cols[0].Hex(),
		Base01: cols[1].Hex(),
		Base02: cols[2].Hex(),
		Base03: cols[3].Hex(),
		Base04: cols[4].Hex(),
		Base05: cols[5].Hex(),
		Base06: cols[6].Hex(),
		Base07: cols[7].Hex(),
		Base08: cols[8].Hex(),
		Base09: cols[9].Hex(),
		Base10: cols[10].Hex(),
		Base11: cols[11].Hex(),
		Base12: cols[12].Hex(),
		Base13: cols[13].Hex(),
		Base14: cols[14].Hex(),
		Base15: cols[15].Hex(),
	}
}

func GetScheme(imagePath string) (*Scheme, []byte, error) {
	f, err := os.Open(imagePath)
	if err != nil {
		return nil, nil, err
	}

	defer f.Close()

	img, _, err := image.Decode(f)
	if err != nil {
		return nil, nil, err
	}

	raw := dominantcolor.FindN(img, 8)
	var cols []colorful.Color
	for _, c := range raw {
		col, _ := colorful.MakeColor(c)
		cols = append(cols, col)
	}

	sort.Slice(cols, func(i, j int) bool {
		_, _, vi := cols[i].Hsv()
		_, _, vj := cols[j].Hsv()

		return vi < vj
	})

	for len(cols) < 16 {
		a := cols[len(cols)-1]
		b := cols[0]

		mid := a.BlendLab(b, float64(len(cols))/16.0)
		cols = append(cols, mid)
	}

	scheme := buildScheme(cols)

	out, err := json.MarshalIndent(scheme, "", " ")
	if err != nil {
		return &scheme, nil, err
	}

	return &scheme, out, nil
}
