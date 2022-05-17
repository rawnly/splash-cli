package unsplash

import (
	"encoding/json"
	"github.com/rawnly/splash-cli/unsplash/models"
)

type GetTopicsRequest struct {
	OrderBy string   `url:"order_by"`
	Page    int      `url:"page" default:"1"`
	PerPage int      `url:"per_page" default:"30"`
	Ids     []string `url:"ids" separator:"comma"`
}

const (
	OrderByFeatured = "featured"
	OrderByLatest   = "latest"
	OrderByPosition = "position"
	OrderByOldest   = "oldest"
)

func (a Api) GetTopics() ([]models.Topic, error) {
	var topics []models.Topic

	data, err := a.get("/topics", nil)

	if err != nil {
		return topics, err
	}

	if err := json.Unmarshal(data, &topics); err != nil {
		return nil, err
	}

	return topics, nil
}
