package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/internal/steam"
	"blog-management/logger"
	"blog-management/utils"

	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required"`
}

type UserController struct{}

func (u UserController) Login(c *gin.Context) {
	var loginReq LoginReq
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	var storedUser model.User
	if err := database.DB.Where("username = ?", loginReq.Username).First(&storedUser).Error; err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "Invalid username or password")
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(loginReq.Password)); err != nil {
		response.Fail(c, http.StatusUnauthorized, -1, "Invalid username or password")
		return
	}

	// 生成 JWT
	token, err := utils.GenToken(storedUser.ID, storedUser.Username)

	if err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to generate token")
		return
	}

	// 在header中添加token
	c.Header("Authorization", "Bearer "+token)
	response.Success(c, gin.H{
		"token":  token,
		"expire": time.Now().Add(8 * time.Hour).Unix(), // 过期时间戳
	})
}

type UpdateProfileReq struct {
	Username     string `json:"username"`
	Email        string `json:"email"`
	ChineseName  string `json:"chineseName"`
	EnglishName  string `json:"englishName"`
	Avatar       string `json:"avatar"`
	GitHubUrl    string `json:"githubUrl"`
	InstagramUrl string `json:"instagramUrl"`
	TwitterUrl   string `json:"twitterUrl"`
	LinkedInUrl  string `json:"linkedinUrl"`
	Bio          string `json:"bio"`
	SteamAPIKey  string `json:"steamAPIKey"`
	SteamID      string `json:"steamID"`
}

type UpdatePasswordReq struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}

func (u UserController) Register(c *gin.Context) {
	var registerReq RegisterReq
	if err := c.ShouldBindJSON(&registerReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(registerReq.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to hash password")
		return
	}

	registerReq.Password = string(hashedPassword)
	user := model.User{
		Username: registerReq.Username,
		Password: registerReq.Password,
		Email:    registerReq.Email,
	}
	if err := database.DB.Create(&user).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create user")
		return
	}

	response.Success(c, nil)
}

func (u UserController) GetProfile(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, -1, "Unauthorized")
		return
	}

	var user model.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		response.Fail(c, http.StatusNotFound, -1, "User not found")
		return
	}

	response.Success(c, gin.H{
		"id":           user.ID,
		"username":     user.Username,
		"email":        user.Email,
		"chineseName":  user.ChineseName,
		"englishName":  user.EnglishName,
		"avatar":       user.Avatar,
		"githubUrl":    user.GitHubUrl,
		"instagramUrl": user.InstagramUrl,
		"twitterUrl":   user.TwitterUrl,
		"linkedinUrl":  user.LinkedInUrl,
		"bio":          user.Bio,
		"steamID":      user.SteamID,
	})
}

func (u UserController) GetPublicProfile(c *gin.Context) {
	var users []model.User
	if err := database.DB.Order("id ASC").Limit(1).Find(&users).Error; err != nil || len(users) == 0 {
		response.Fail(c, http.StatusNotFound, -1, "Profile not found")
		return
	}

	user := users[0]
	response.Success(c, gin.H{
		"chineseName":  user.ChineseName,
		"englishName":  user.EnglishName,
		"avatar":       user.Avatar,
		"githubUrl":    user.GitHubUrl,
		"instagramUrl": user.InstagramUrl,
		"twitterUrl":   user.TwitterUrl,
		"linkedinUrl":  user.LinkedInUrl,
		"bio":          user.Bio,
	})
}

func (u UserController) UpdateProfile(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, -1, "Unauthorized")
		return
	}

	var updateReq UpdateProfileReq
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	var user model.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		response.Fail(c, http.StatusNotFound, -1, "User not found")
		return
	}

	if updateReq.Username != "" && updateReq.Username != user.Username {
		var existingUser model.User
		if err := database.DB.Where("username = ? AND id != ?", updateReq.Username, user.ID).First(&existingUser).Error; err == nil {
			response.Fail(c, http.StatusBadRequest, -1, "Username already exists")
			return
		}
		user.Username = updateReq.Username
	}

	if updateReq.Email != "" && updateReq.Email != user.Email {
		var existingUser model.User
		if err := database.DB.Where("email = ? AND id != ?", updateReq.Email, user.ID).First(&existingUser).Error; err == nil {
			response.Fail(c, http.StatusBadRequest, -1, "Email already exists")
			return
		}
		user.Email = updateReq.Email
	}

	if updateReq.ChineseName != "" {
		user.ChineseName = updateReq.ChineseName
	}
	if updateReq.EnglishName != "" {
		user.EnglishName = updateReq.EnglishName
	}
	if updateReq.Avatar != "" {
		user.Avatar = updateReq.Avatar
	}
	if updateReq.GitHubUrl != "" {
		user.GitHubUrl = updateReq.GitHubUrl
	}
	if updateReq.InstagramUrl != "" {
		user.InstagramUrl = updateReq.InstagramUrl
	}
	if updateReq.TwitterUrl != "" {
		user.TwitterUrl = updateReq.TwitterUrl
	}
	if updateReq.LinkedInUrl != "" {
		user.LinkedInUrl = updateReq.LinkedInUrl
	}
	if updateReq.Bio != "" {
		user.Bio = updateReq.Bio
	}

	steamConfigChanged := false
	if updateReq.SteamAPIKey != "" {
		if user.SteamAPIKey != updateReq.SteamAPIKey {
			steamConfigChanged = true
		}
		user.SteamAPIKey = updateReq.SteamAPIKey
	}
	if updateReq.SteamID != "" {
		if user.SteamID != updateReq.SteamID {
			steamConfigChanged = true
		}
		user.SteamID = updateReq.SteamID
	}

	if err := database.DB.Save(&user).Error; err != nil {
		logger.Logger.Error("Failed to update user profile", zap.Uint("userID", user.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to update profile")
		return
	}

	if steamConfigChanged {
		steamService := steam.GetSteamService()
		steamService.ClearCache(user.ID, user.SteamID)
		logger.Logger.Info("Steam configuration updated, cache cleared", zap.Uint("userID", user.ID))
	}

	response.Success(c, gin.H{
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":           user.ID,
			"username":     user.Username,
			"email":        user.Email,
			"chineseName":  user.ChineseName,
			"englishName":  user.EnglishName,
			"avatar":       user.Avatar,
			"githubUrl":    user.GitHubUrl,
			"instagramUrl": user.InstagramUrl,
			"twitterUrl":   user.TwitterUrl,
			"linkedinUrl":  user.LinkedInUrl,
			"bio":          user.Bio,
			"steamID":      user.SteamID,
		},
	})
}

func (u UserController) UpdatePassword(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		response.Fail(c, http.StatusUnauthorized, -1, "Unauthorized")
		return
	}

	var updateReq UpdatePasswordReq
	if err := c.ShouldBindJSON(&updateReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	var user model.User
	if err := database.DB.First(&user, userId).Error; err != nil {
		response.Fail(c, http.StatusNotFound, -1, "User not found")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(updateReq.OldPassword)); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "Current password is incorrect")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updateReq.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to hash password")
		return
	}

	user.Password = string(hashedPassword)
	if err := database.DB.Save(&user).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to update password")
		return
	}

	response.Success(c, gin.H{
		"message": "Password updated successfully",
	})
}
