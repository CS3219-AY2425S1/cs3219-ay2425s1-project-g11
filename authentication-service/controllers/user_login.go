package controllers

import (
	"context"
	"net/http"

	"authentication-service/models"
	"authentication-service/services"
	"authentication-service/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// LoginUser handles user login requests
func LoginUser(c *gin.Context) {
	var loginRequest models.LoginRequest
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Retrieve user from the database
	var user models.UserModel
	err := services.GetUserByEmail(context.TODO(), loginRequest.Email, &user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Compare the password with the stored password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginRequest.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Successful login, generate JWT token
	token, err := utils.GenerateAccountToken(user.Name, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	// Successful login
	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": token})
}
