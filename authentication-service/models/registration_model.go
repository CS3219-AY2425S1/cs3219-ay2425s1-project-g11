package models

import "time"

type ManualRegistrationRequest struct {
    Email     string    `json:"email" bson:"email"`
    Name      string    `json:"name" bson:"name"`
    Password  string    `json:"password" bson:"password"`
    CreatedAt time.Time `bson:"createdDate"`
    Type      string    `bson:"accountType"`
}

type OAuthRegistrationRequest struct {
    Email     string    `json:"email" bson:"email"`
    Name      string    `json:"name" bson:"name"`
    CreatedAt time.Time `bson:"createdDate"`
    Type      string    `bson:"accountType"`
}