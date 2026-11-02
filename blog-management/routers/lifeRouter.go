package routers

import (
	"blog-management/internal/controllers"
	"github.com/gin-gonic/gin"
)

func LifeRouterInit(r *gin.Engine) {
	momentRouter := r.Group("/moment")
	{
		momentRouter.POST("/list", controllers.MomentController{}.List)
		momentRouter.POST("/create", controllers.MomentController{}.Create)
		momentRouter.GET("/list/detail/:moment_id", controllers.MomentController{}.Detail)
		momentRouter.POST("/update", controllers.MomentController{}.Edit)
		momentRouter.POST("/delete", controllers.MomentController{}.Delete)
		momentRouter.POST("/like", controllers.MomentController{}.Like)
	}

	visitedCityRouter := r.Group("/visited-city")
	{
		visitedCityRouter.POST("/list", controllers.VisitedCityController{}.List)
		visitedCityRouter.POST("/create", controllers.VisitedCityController{}.Create)
		visitedCityRouter.GET("/list/detail/:city_id", controllers.VisitedCityController{}.Detail)
		visitedCityRouter.POST("/update", controllers.VisitedCityController{}.Edit)
		visitedCityRouter.POST("/delete", controllers.VisitedCityController{}.Delete)
	}

	momentCommentRouter := r.Group("/moment-comment")
	{
		momentCommentRouter.POST("/list", controllers.MomentCommentController{}.List)
		momentCommentRouter.POST("/create", controllers.MomentCommentController{}.Create)
		momentCommentRouter.POST("/like", controllers.MomentCommentController{}.Like)
	}
}
