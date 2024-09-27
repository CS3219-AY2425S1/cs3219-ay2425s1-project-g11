package controllers

import (
    "context"
    "log"
    "net/http"
    "time"
    
    "authentication-service/models"
    "authentication-service/services"
    "authentication-service/utils"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
)

func ManualRegisterUser(c *gin.Context) {
    var user models.ManualRegistrationRequest

    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
        return
    }

    if user.Email == "" || user.Name == "" || user.Password == "" {
        log.Printf("Error inserting user into database: %v", user.Type)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Email, username, and password are required"})
        return
    }

    var existingUser models.ManualRegistrationRequest
    userCollection := services.GetUserCollection()
    err := userCollection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
    if err == nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
        return
    }

    hashedPassword, err := utils.HashPassword(user.Password) // Use the new hash function from utils
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
        return
    }

    user.Password = hashedPassword
    user.CreatedAt = time.Now()
    user.Type = "User"

    _, err = userCollection.InsertOne(context.TODO(), user)
    if err != nil {
        log.Printf("Error inserting user into database: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error inserting user into database"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}
