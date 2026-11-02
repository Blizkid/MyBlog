package routers

import (
	"blog-management/internal/controllers"
	"github.com/gin-gonic/gin"
)

func UserRouterInit(r *gin.Engine) {
	userRouter := r.Group("/user")
	{
		userRouter.POST("/login", controllers.UserController{}.Login)
		userRouter.POST("/register", controllers.UserController{}.Register)
		userRouter.GET("/profile/public", controllers.UserController{}.GetPublicProfile)
		userRouter.GET("/profile", controllers.UserController{}.GetProfile)
		userRouter.PUT("/profile", controllers.UserController{}.UpdateProfile)
		userRouter.PUT("/password", controllers.UserController{}.UpdatePassword)
	}
}
