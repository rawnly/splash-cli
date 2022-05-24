package unsplash

import (
	"encoding/json"
	"fmt"
	"github.com/rawnly/splash-cli/unsplash/models"
)

func (a Api) GetCollection(id string) (*models.Collection, error) {
	r, err := a.get(fmt.Sprintf("/collections/%s", id), nil)

	if err != nil {
		return nil, err
	}

	var collection models.Collection
	if err := json.Unmarshal(r, &collection); err != nil {
		return nil, err
	}

	return &collection, nil
}
