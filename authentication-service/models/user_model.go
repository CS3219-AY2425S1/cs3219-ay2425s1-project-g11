package models

import "time"

type UserModel struct {
    Email     string    `bson:"email"`
    Name      string    `bson:"name"`
    Password  string    `bson:"password"`
    CreatedAt time.Time `bson:"createdDate"`
    Type      string    `bson:"accountType"`
}