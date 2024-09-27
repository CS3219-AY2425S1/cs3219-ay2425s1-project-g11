package utils

import (
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

var	GithubOAuthConfig = &oauth2.Config{
	ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
	ClientSecret: os.Getenv("GITHUB_OAUTH_SECRET"),
	RedirectURL:  os.Getenv("GITHUB_CALLBACK_URL"),
	Scopes:       []string{"user:email"},
	Endpoint:     github.Endpoint,
}

var GoogleOAuthConfig = &oauth2.Config{
	ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_OAUTH_SECRET"),
	RedirectURL:  os.Getenv("GOOGLE_CALLBACK_URL"),
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	Endpoint:     google.Endpoint,
}