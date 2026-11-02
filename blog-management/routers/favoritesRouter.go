package routers

import (
	"blog-management/internal/controllers"

	"github.com/gin-gonic/gin"
)

func FavoritesRouterInit(r *gin.Engine) {
	movieRouter := r.Group("/movie")
	{
		movieRouter.POST("/list", controllers.MovieController{}.List)
		movieRouter.POST("/create", controllers.MovieController{}.Create)
		movieRouter.GET("/list/detail/:movie_id", controllers.MovieController{}.Detail)
		movieRouter.POST("/update", controllers.MovieController{}.Edit)
		movieRouter.POST("/delete", controllers.MovieController{}.Delete)
	}

	musicRouter := r.Group("/music")
	{
		musicRouter.POST("/list", controllers.MusicController{}.List)
		musicRouter.POST("/create", controllers.MusicController{}.Create)
		musicRouter.GET("/list/detail/:music_id", controllers.MusicController{}.Detail)
		musicRouter.POST("/update", controllers.MusicController{}.Edit)
		musicRouter.POST("/delete", controllers.MusicController{}.Delete)
	}

	bookRouter := r.Group("/book")
	{
		bookRouter.POST("/list", controllers.BookController{}.List)
		bookRouter.POST("/create", controllers.BookController{}.Create)
		bookRouter.GET("/list/detail/:book_id", controllers.BookController{}.Detail)
		bookRouter.POST("/update", controllers.BookController{}.Edit)
		bookRouter.POST("/delete", controllers.BookController{}.Delete)
	}

	lifeTimeAllocationRouter := r.Group("/life-time-allocation")
	{
		lifeTimeAllocationRouter.POST("/list", controllers.LifeTimeAllocationController{}.List)
		lifeTimeAllocationRouter.POST("/create", controllers.LifeTimeAllocationController{}.Create)
		lifeTimeAllocationRouter.GET("/list/detail/:allocation_id", controllers.LifeTimeAllocationController{}.Detail)
		lifeTimeAllocationRouter.POST("/update", controllers.LifeTimeAllocationController{}.Edit)
		lifeTimeAllocationRouter.POST("/delete", controllers.LifeTimeAllocationController{}.Delete)
		lifeTimeAllocationRouter.POST("/list/year", controllers.LifeTimeAllocationController{}.ListByYear)
		lifeTimeAllocationRouter.POST("/list/month", controllers.LifeTimeAllocationController{}.ListByMonth)
		lifeTimeAllocationRouter.GET("/years", controllers.LifeTimeAllocationController{}.GetYearList)
	}

	wordCloudTagRouter := r.Group("/word-cloud-tag")
	{
		wordCloudTagRouter.POST("/list", controllers.WordCloudTagController{}.List)
		wordCloudTagRouter.POST("/create", controllers.WordCloudTagController{}.Create)
		wordCloudTagRouter.GET("/list/detail/:tag_id", controllers.WordCloudTagController{}.Detail)
		wordCloudTagRouter.POST("/update", controllers.WordCloudTagController{}.Edit)
		wordCloudTagRouter.POST("/delete", controllers.WordCloudTagController{}.Delete)
	}
}
