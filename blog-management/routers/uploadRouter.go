package routers

import (
	"blog-management/internal/controllers"

	"github.com/gin-gonic/gin"
)

func UploadRouterInit(r *gin.Engine) {
	r.Static("/uploads", "./uploads")

	uploadRouter := r.Group("/upload")
	{
		uploadRouter.POST("/image", controllers.UploadController{}.UploadImage)
		uploadRouter.POST("/audio", controllers.UploadController{}.UploadAudio)
	}
}
