package routers

import (
	"blog-management/internal/controllers"

	"github.com/gin-gonic/gin"
)

func CodeRouterInit(r *gin.Engine) {
	workExperienceRouter := r.Group("/work-experience")
	{
		workExperienceRouter.POST("/list", controllers.WorkExperienceController{}.List)
		workExperienceRouter.GET("/public/list", controllers.WorkExperienceController{}.PublicList)
		workExperienceRouter.POST("/create", controllers.WorkExperienceController{}.CreateWorkExperience)
		workExperienceRouter.POST("/update", controllers.WorkExperienceController{}.Edit)
		workExperienceRouter.POST("/delete", controllers.WorkExperienceController{}.Delete)
	}

	personalProjectRouter := r.Group("/personal-project")
	{
		personalProjectRouter.POST("/list", controllers.PersonalProjectController{}.List)
		personalProjectRouter.GET("/public/list", controllers.PersonalProjectController{}.PublicList)
		personalProjectRouter.POST("/create", controllers.PersonalProjectController{}.CreatePersonalProject)
		personalProjectRouter.POST("/update", controllers.PersonalProjectController{}.Edit)
		personalProjectRouter.POST("/delete", controllers.PersonalProjectController{}.Delete)
	}

	recommendedRepoRouter := r.Group("/recommended-repo")
	{
		recommendedRepoRouter.POST("/list", controllers.RecommendedRepoController{}.List)
		recommendedRepoRouter.GET("/public/list", controllers.RecommendedRepoController{}.PublicList)
		recommendedRepoRouter.POST("/create", controllers.RecommendedRepoController{}.CreateRecommendedRepo)
		recommendedRepoRouter.POST("/update", controllers.RecommendedRepoController{}.Edit)
		recommendedRepoRouter.POST("/delete", controllers.RecommendedRepoController{}.Delete)
	}
}
