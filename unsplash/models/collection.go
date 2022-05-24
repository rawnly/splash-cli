package models

type Collection struct {
	Model
	Title       string `json:"title"`
	Description string `json:"description"`
	Featured    bool   `json:"featured"`
	TotalPhotos int    `json:"total_photos"`

	Links struct {
		Self   string `json:"self"`
		Html   string `json:"html"`
		Photos string `json:"photos"`
	} `json:"links"`

	User User `json:"user"`
}
