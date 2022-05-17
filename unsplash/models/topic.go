package models

type Topic struct {
	Id          string `json:"id"`
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Owners      []struct {
		Id       string `json:"id"`
		Username string `json:"username"`
		Name     string `json:"name"`
	} `json:"owners"`
}
