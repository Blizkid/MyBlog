package middleware

import (
	"blog-management/internal/response"
	"blog-management/utils"
	"net/http"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
)

var whiteList = []string{
	"/user/login",
	"/user/register",
	"/user/profile/public",
	"/favorite-game/list",
	"/developed-game/list",
	"/upload/image",
	"/upload/audio",
	"/steam/summary",
}

var whiteListPrefixes = []string{
	"/uploads/",
	"/work-experience/public/",
	"/personal-project/public/",
	"/recommended-repo/public/",
}

func isInWhiteList(path string) bool {
	if slices.Contains(whiteList, path) {
		return true
	}
	for _, prefix := range whiteListPrefixes {
		if strings.HasPrefix(path, prefix) {
			return true
		}
	}
	return false
}

const (
	bearerWord       string = "Bearer"
	authorizationKey string = "Authorization"
)

func AuthJWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestPath := c.Request.URL.Path

		// 过滤一部分路由
		if isInWhiteList(requestPath) || slices.Contains(whiteList, c.FullPath()) {
			c.Next()
			return
		}
		authHeader := c.Request.Header.Get(authorizationKey)
		if authHeader == "" {
			response.Fail(c, http.StatusUnauthorized, -1, "token is missing")
			c.Abort()
			return
		}
		parts := strings.SplitN(authHeader, " ", 2) //例如：如果authHeader是"Bearer abc123"，分割后得到parts切片为["Bearer", "abc123"]
		if !(len(parts) == 2 && parts[0] == bearerWord) {
			response.Fail(c, http.StatusUnauthorized, -1, "token is invalid")
			c.Abort()
			return
		}
		mc, err := utils.ParseToken(parts[1])
		if err != nil {
			response.Fail(c, http.StatusUnauthorized, -1, "token is invalid")
			c.Abort()
			return
		}
		c.Set("userID", mc.UserID)
		c.Set("userName", mc.Username)
		c.Next()
	}
}
