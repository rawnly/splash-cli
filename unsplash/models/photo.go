package models

type Photo struct {
	Id          string    `json:"id"`
	Downloads   int       `json:"downloads"`
	Likes       int       `json:"likes"`
	Views       int       `json:"views"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	CreatedAt   string    `json:"created_at"`
	Description string    `json:"description"`
	Color       string    `json:"color"`
	LikedByUser bool      `json:"liked_by_user"`
	Urls        PhotoUrls `json:"urls"`
}

type PhotoUrls struct {
	Raw     string `json:"raw"`
	Full    string `json:"full"`
	Regular string `json:""`
	Small   string `json:"small"`
	Thumb   string `json:"thumb"`
}

type PhotoOfTheDay struct {
	Id string `json:"id"`
}

type RandomPhotoParams struct {
	Orientation string   `url:"orientation" default:"landscape"`
	Query       string   `url:"query"`
	Collections []string `url:"collections" separator:"comma"`
	Count       int      `url:"count" default:"1"`
	User        string   `url:"user"`
}
