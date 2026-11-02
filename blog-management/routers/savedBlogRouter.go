package routers

import (
	"blog-management/internal/controllers"

	"github.com/gin-gonic/gin"
)

func SavedBlogRouterInit(r *gin.Engine) {
	savedBlogRouter := r.Group("/saved-blog")
	{
		savedBlogRouter.POST("/list", controllers.SavedBlogController{}.List)
		savedBlogRouter.POST("/create", controllers.SavedBlogController{}.Create)
		savedBlogRouter.GET("/list/detail/:saved_blog_id", controllers.SavedBlogController{}.Detail)
		savedBlogRouter.POST("/update", controllers.SavedBlogController{}.Edit)
		savedBlogRouter.POST("/delete", controllers.SavedBlogController{}.Delete)
	}
}
