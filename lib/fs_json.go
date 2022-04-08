package lib

import (
	"encoding/json"
	"io/ioutil"
)

func WriteJson(filepath string, data any) error {
	file, err := json.MarshalIndent(data, "", "")

	if err != nil {
		return err
	}

	return ioutil.WriteFile(filepath, file, 0644)
}

func ReadJson(file string, data any) error {
	b, err := ioutil.ReadFile(file)

	if err != nil {
		return err
	}

	return json.Unmarshal(b, &data)
}
