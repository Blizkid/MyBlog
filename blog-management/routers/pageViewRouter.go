package routers

import (
	"blog-management/internal/controllers"
	"github.com/gin-gonic/gin"
)

func PageViewRouterInit(r *gin.Engine) {
	pageViewRouter := r.Group("/pageview")
	{
		pageViewRouter.POST("/record", controllers.PageViewController{}.RecordVisit)
		pageViewRouter.GET("/stats", controllers.PageViewController{}.GetStats)
	}
}
