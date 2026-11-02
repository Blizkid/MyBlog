package routers

import (
	"blog-management/internal/middleware"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CorsMiddleware(), middleware.LogMiddleware(), middleware.AuthJWTMiddleware())
	UploadRouterInit(r)
	UserRouterInit(r)
	PostRouterInit(r)
	CommentRouterInit(r)
	GameRouterInit(r)
	LifeRouterInit(r)
	FavoritesRouterInit(r)
	SavedBlogRouterInit(r)
	CodeRouterInit(r)
	SteamRouterInit(r)
	PageViewRouterInit(r)
	return r
}
