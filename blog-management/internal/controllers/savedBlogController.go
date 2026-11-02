package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
	"strconv"
)

type CreateSavedBlogReq struct {
	Title       string `json:"title" binding:"required"`
	Excerpt     string `json:"excerpt"`
	Author      string `json:"author"`
	Source      string `json:"source"`
	Tags        string `json:"tags"`
	Category    string `json:"category"`
	URL         string `json:"url" binding:"required"`
	PublishedAt string `json:"publishedAt"`
}

type EditSavedBlogReq struct {
	ID          uint   `json:"id" binding:"required"`
	Title       string `json:"title"`
	Excerpt     string `json:"excerpt"`
	Author      string `json:"author"`
	Source      string `json:"source"`
	Tags        string `json:"tags"`
	Category    string `json:"category"`
	URL         string `json:"url"`
	PublishedAt string `json:"publishedAt"`
}

type DeleteSavedBlogReq struct {
	ID uint `json:"id"`
}

type SavedBlogController struct{}

func (s SavedBlogController) Create(c *gin.Context) {
	var req CreateSavedBlogReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	savedBlog := model.SavedBlog{
		Title:       req.Title,
		Excerpt:     req.Excerpt,
		Author:      req.Author,
		Source:      req.Source,
		Tags:        req.Tags,
		Category:    req.Category,
		URL:         req.URL,
		PublishedAt: req.PublishedAt,
		UserID:      userId,
	}

	if err := database.DB.Create(&savedBlog).Error; err != nil {
		logger.Logger.Error("Failed to create saved blog", zap.String("title", req.Title), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create saved blog")
		return
	}

	response.Success(c, savedBlog)
}

func (s SavedBlogController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var savedBlogs []model.SavedBlog
	if err := database.DB.Where("user_id = ?", userId).Find(&savedBlogs).Error; err != nil {
		logger.Logger.Error("saved blog list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list saved blogs")
		return
	}

	response.Success(c, savedBlogs)
}

func (s SavedBlogController) Detail(c *gin.Context) {
	savedBlogIdStr := c.Param("saved_blog_id")
	savedBlogId, err := strconv.ParseUint(savedBlogIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid saved_blog_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var savedBlog model.SavedBlog
	if err := database.DB.Where("id = ? AND user_id = ?", savedBlogId, userId).First(&savedBlog).Error; err != nil {
		logger.Logger.Error("get saved blog detail failed", zap.Uint("UserId", userId), zap.Uint64("SavedBlogID", savedBlogId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get saved blog detail")
		return
	}

	response.Success(c, savedBlog)
}

func (s SavedBlogController) Edit(c *gin.Context) {
	var req EditSavedBlogReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse saved blog request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var savedBlog model.SavedBlog
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&savedBlog).Error; err != nil {
		logger.Logger.Error("edit saved blog failed", zap.Uint("UserId", userId), zap.Uint("SavedBlogID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit saved blog")
		return
	}

	if savedBlog.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Title != "" {
		updateColumn["title"] = req.Title
	}
	if req.Excerpt != "" {
		updateColumn["excerpt"] = req.Excerpt
	}
	if req.Author != "" {
		updateColumn["author"] = req.Author
	}
	if req.Source != "" {
		updateColumn["source"] = req.Source
	}
	if req.Tags != "" {
		updateColumn["tags"] = req.Tags
	}
	if req.Category != "" {
		updateColumn["category"] = req.Category
	}
	if req.URL != "" {
		updateColumn["url"] = req.URL
	}
	if req.PublishedAt != "" {
		updateColumn["published_at"] = req.PublishedAt
	}

	if err := database.DB.Model(&model.SavedBlog{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit saved blog failed",
			zap.Uint("SavedBlogID", req.ID),
			zap.String("title", req.Title),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit saved blog")
		return
	}

	response.Success(c, nil)
}

func (s SavedBlogController) Delete(c *gin.Context) {
	var req DeleteSavedBlogReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse saved blog request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var savedBlog model.SavedBlog
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&savedBlog)
	if result.Error != nil {
		logger.Logger.Error("delete saved blog failed",
			zap.Uint("UserId", userId),
			zap.Uint("savedBlogID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Saved blog not found")
		return
	}

	if result.RowsAffected == 0 || savedBlog.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.SavedBlog{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete saved blog failed", zap.Uint("SavedBlogID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete saved blog")
		return
	}

	response.Success(c, nil)
}
