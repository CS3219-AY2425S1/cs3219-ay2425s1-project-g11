package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"authentication-service/utils"
)

func OAuthLogin(c *gin.Context) {
	provider := c.Param("provider")
	var config *oauth2.Config

	switch provider {
	case "github":
		config = utils.GithubOAuthConfig
	case "google":
		config = utils.GoogleOAuthConfig
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OAuth provider"})
		return
	}

	url := config.AuthCodeURL("state", oauth2.AccessTypeOnline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func OAuthCallback(c *gin.Context) {
	provider := c.Param("provider")
	var config *oauth2.Config
	var userInfoURL string

	switch provider {
	case "github":
		config = utils.GithubOAuthConfig
		userInfoURL = "https://api.github.com/user"
	case "google":
		config = utils.GoogleOAuthConfig
		userInfoURL = "https://www.googleapis.com/oauth2/v2/userinfo"
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OAuth provider"})
		return
	}

	code := c.Query("code")
	token, err := config.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code exchange failed"})
		return
	}

	client := config.Client(context.Background(), token)
	resp, err := client.Get(userInfoURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user info"})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response body"})
		return
	}

	var userInfo map[string]interface{}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}

	// Extract username and email based on provider
	var username, oauth_id string
	switch provider {
	case "github":
		username = fmt.Sprint(userInfo["login"])
		oauth_id = fmt.Sprint(userInfo["id"])
	case "google":
		username = fmt.Sprint(userInfo["name"])
		oauth_id = fmt.Sprint(userInfo["sub"])
	}

	// Generate JWT after successful login
	jwtToken, err := utils.GenerateOAuthToken(provider, oauth_id, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": jwtToken, "user": username, "oauth_id": oauth_id, "provider": provider})
}