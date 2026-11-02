package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
)

type CreateRecommendedRepoReq struct {
	Name        string `json:"name" binding:"required"`
	Author      string `json:"author" binding:"required"`
	Description string `json:"description"`
	Github      string `json:"github" binding:"required"`
	Stars       uint   `json:"stars"`
	Language    string `json:"language"`
	Tags        string `json:"tags"`
}

type EditRecommendedRepoReq struct {
	ID          uint   `json:"id" binding:"required"`
	Name        string `json:"name"`
	Author      string `json:"author"`
	Description string `json:"description"`
	Github      string `json:"github"`
	Stars       uint   `json:"stars"`
	Language    string `json:"language"`
	Tags        string `json:"tags"`
}

type DeleteRecommendedRepoReq struct {
	ID uint `json:"id"`
}

type RecommendedRepoController struct{}

func (r RecommendedRepoController) CreateRecommendedRepo(c *gin.Context) {
	var createRecommendedRepoReq CreateRecommendedRepoReq
	if err := c.ShouldBind(&createRecommendedRepoReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	recommendedRepo := model.RecommendedRepo{
		Name:        createRecommendedRepoReq.Name,
		Author:      createRecommendedRepoReq.Author,
		Description: createRecommendedRepoReq.Description,
		Github:      createRecommendedRepoReq.Github,
		Stars:       createRecommendedRepoReq.Stars,
		Language:    createRecommendedRepoReq.Language,
		Tags:        createRecommendedRepoReq.Tags,
		UserID:      userId,
	}

	if err := database.DB.Create(&recommendedRepo).Error; err != nil {
		logger.Logger.Error("Failed to create recommended repo", 
			zap.String("name", createRecommendedRepoReq.Name), 
			zap.String("author", createRecommendedRepoReq.Author), 
			zap.Uint("userId", userId), 
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to insert recommended repo")
		return
	}

	response.Success(c, recommendedRepo)
}

func (r RecommendedRepoController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var recommendedRepos []model.RecommendedRepo
	if err := database.DB.Where("user_id = ?", userId).Find(&recommendedRepos).Error; err != nil {
		logger.Logger.Error("recommended repo list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list recommended repos")
		return
	}

	response.Success(c, recommendedRepos)
}

func (r RecommendedRepoController) PublicList(c *gin.Context) {
	var recommendedRepos []model.RecommendedRepo
	if err := database.DB.Find(&recommendedRepos).Error; err != nil {
		logger.Logger.Error("public recommended repo list failed", zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list recommended repos")
		return
	}

	response.Success(c, recommendedRepos)
}

func (r RecommendedRepoController) Edit(c *gin.Context) {
	var req EditRecommendedRepoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse recommended repo request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var recommendedRepo model.RecommendedRepo
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&recommendedRepo).Error; err != nil {
		logger.Logger.Error("edit recommended repo failed", 
			zap.Uint("UserId", userId), 
			zap.Uint("ID", req.ID), 
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit recommended repo")
		return
	}
	if recommendedRepo.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Name != "" {
		updateColumn["name"] = req.Name
	}
	if req.Author != "" {
		updateColumn["author"] = req.Author
	}
	if req.Description != "" {
		updateColumn["description"] = req.Description
	}
	if req.Github != "" {
		updateColumn["github"] = req.Github
	}
	if req.Stars > 0 {
		updateColumn["stars"] = req.Stars
	}
	if req.Language != "" {
		updateColumn["language"] = req.Language
	}
	if req.Tags != "" {
		updateColumn["tags"] = req.Tags
	}

	if err := database.DB.Model(&model.RecommendedRepo{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit recommended repo failed",
			zap.Uint("ID", req.ID),
			zap.String("name", req.Name),
			zap.String("author", req.Author),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit recommended repo")
		return
	}

	response.Success(c, nil)
}

func (r RecommendedRepoController) Delete(c *gin.Context) {
	var req DeleteRecommendedRepoReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse recommended repo request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var recommendedRepo model.RecommendedRepo
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&recommendedRepo).Error; err != nil {
		logger.Logger.Error("delete recommended repo failed",
			zap.Uint("UserId", userId),
			zap.Uint("ID", req.ID),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete recommended repo")
		return
	}

	if recommendedRepo.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}
	if err := database.DB.Model(&model.RecommendedRepo{}).Delete(&model.RecommendedRepo{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete recommended repo failed", zap.Uint("ID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete recommended repo")
		return
	}

	response.Success(c, nil)
}
