package routes

import (
    "authentication-service/controllers"
    "github.com/gin-gonic/gin"
)

func InitialiseRoutes(r *gin.Engine) {
    r.POST("/register", controllers.ManualRegisterUser)
	r.POST("/login", controllers.LoginUser)
    r.GET("/auth/:provider", controllers.OAuthLogin)
    r.GET("/auth/:provider/callback", controllers.OAuthCallback)
    r.GET("/jwt", controllers.TokenLogin)
}
