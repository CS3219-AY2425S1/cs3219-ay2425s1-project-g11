package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword generates a hashed password using bcrypt.
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    return string(bytes), err
}