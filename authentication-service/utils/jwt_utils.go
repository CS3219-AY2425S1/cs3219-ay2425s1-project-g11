package utils

import (
	"os"
	"errors"
	"time"
	"github.com/golang-jwt/jwt"
)

func GenerateAccountToken(username string, email string) (string, error) {
	var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
	claims := jwt.MapClaims{
		"name": username,
		"email":  email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(), // Token valid for 24 hours
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	return token.SignedString(jwtSecret)
}

func GenerateOAuthToken(provider string, oauth_id string, username string) (string, error) {
	var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
	claims := jwt.MapClaims{
		"name": username,
		"oauth_id":  oauth_id,
		"provider": provider,
		"exp":   time.Now().Add(time.Hour * 24).Unix(), // Token valid for 24 hours
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	return token.SignedString(jwtSecret)
}

func VerifyToken(tokenString string) (*jwt.Token, error) {
	var jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))

	// Parse the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	// Verify if token is valid and not expired
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		expiry := int64(claims["exp"].(float64))
		if expiry < time.Now().Unix() {
			return nil, errors.New("token has expired")
		}
		return token, nil
	}

	return nil, errors.New("invalid token")
}