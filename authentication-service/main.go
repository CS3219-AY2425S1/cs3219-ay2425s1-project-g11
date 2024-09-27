package main

import (
    "log"
    "os"

	"authentication-service/routes"
    "authentication-service/services"
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    err := godotenv.Load(".env.dev")
    if err != nil {
        log.Fatalf("Error loading .env.dev file")
    }

    defer services.DisconnectDB()
    
    r := gin.Default()
    r.Use(cors.Default())
	routes.InitialiseRoutes(r)
    port := os.Getenv("PORT")
    if port == "" {
        port = "4040"
    }
    r.Run(":" + port)
}
