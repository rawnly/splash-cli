package models

type AuthRes struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	Scope        string `json:"scope"`
	CreatedAT    int    `json:"created_at"`
	RefreshToken string `json:"refresh_token"`
}
