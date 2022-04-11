package models

type User struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

type Me struct {
	Id        string `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Bio       string `json:"bio"`
	Email     string `json:"email"`
	Downloads int32  `json:"downloads"`
}
