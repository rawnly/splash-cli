package unsplash

import (
	"encoding/json"
	"fmt"
	"github.com/rawnly/splash-cli/unsplash/models"
)

func (a Api) GetUser(username string) (*models.User, error) {
	data, err := a.get(fmt.Sprintf("/users/%s", username), nil)

	if err != nil {
		return nil, err
	}

	var user models.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}

	return &user, nil
}
