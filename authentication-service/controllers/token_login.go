package controllers

import (
	"net/http"

	"authentication-service/models"
	"authentication-service/services"
	"authentication-service/utils"
	"github.com/golang-jwt/jwt"
	"github.com/gin-gonic/gin"
)

// Handles JWT token requests
func TokenLogin(c *gin.Context) {
	// Get the token from the request query string
	var tokenString = c.Query("token")
	if tokenString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token not provided"})
		return
	}

	// Verify the token using the utility function
	token, err := utils.VerifyToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Extract claims from the token (e.g., the user's email)
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// Retrieve user details based on the email claim
	email, ok := claims["email"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	var user models.UserModel
	err = services.GetUserByEmail(c.Request.Context(), email, &user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return the user's account details
	c.JSON(http.StatusOK, gin.H{
		"email": user.Email,
		"name":  user.Name,
	})
}