package routers

import (
	"blog-management/internal/controllers"
	"github.com/gin-gonic/gin"
)

func GameRouterInit(r *gin.Engine) {
	favoriteGameRouter := r.Group("/favorite-game")
	{
		favoriteGameRouter.POST("/list", controllers.FavoriteGameController{}.List)
		favoriteGameRouter.POST("/create", controllers.FavoriteGameController{}.Create)
		favoriteGameRouter.GET("/list/detail/:game_id", controllers.FavoriteGameController{}.Detail)
		favoriteGameRouter.POST("/update", controllers.FavoriteGameController{}.Edit)
		favoriteGameRouter.POST("/delete", controllers.FavoriteGameController{}.Delete)
	}

	developedGameRouter := r.Group("/developed-game")
	{
		developedGameRouter.POST("/list", controllers.DevelopedGameController{}.List)
		developedGameRouter.POST("/create", controllers.DevelopedGameController{}.Create)
		developedGameRouter.GET("/list/detail/:game_id", controllers.DevelopedGameController{}.Detail)
		developedGameRouter.POST("/update", controllers.DevelopedGameController{}.Edit)
		developedGameRouter.POST("/delete", controllers.DevelopedGameController{}.Delete)
	}
}
