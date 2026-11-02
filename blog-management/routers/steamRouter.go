package routers

import (
	"blog-management/internal/controllers"

	"github.com/gin-gonic/gin"
)

func SteamRouterInit(r *gin.Engine) {
	steamRouter := r.Group("/steam")
	{
		steamRouter.GET("/summary", controllers.SteamController{}.GetSummary)
		steamRouter.POST("/refresh", controllers.SteamController{}.Refresh)
		steamRouter.POST("/test-connection", controllers.SteamController{}.TestConnection)
	}
}
