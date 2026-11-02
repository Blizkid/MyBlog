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

type CreateWordCloudTagReq struct {
	Text     string `json:"text" binding:"required"`
	Category string `json:"category" binding:"required"`
	Weight   int    `json:"weight" binding:"required"`
	Color    string `json:"color" binding:"required"`
}

type EditWordCloudTagReq struct {
	ID          uint                  `json:"id" binding:"required"`
	WordCloudTag model.WordCloudTag `json:"wordCloudTag" binding:"required"`
}

type DeleteWordCloudTagReq struct {
	ID uint `json:"id"`
}

type WordCloudTagController struct{}

func (w WordCloudTagController) Create(c *gin.Context) {
	var req CreateWordCloudTagReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	tag := model.WordCloudTag{
		Text:     req.Text,
		Category: req.Category,
		Weight:   req.Weight,
		Color:    req.Color,
		UserID:   userId,
	}

	if err := database.DB.Create(&tag).Error; err != nil {
		logger.Logger.Error("Failed to create word cloud tag", zap.String("text", req.Text), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create word cloud tag")
		return
	}

	response.Success(c, tag)
}

func (w WordCloudTagController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var tags []model.WordCloudTag
	if err := database.DB.Where("user_id = ?", userId).Find(&tags).Error; err != nil {
		logger.Logger.Error("word cloud tag list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list word cloud tags")
		return
	}

	response.Success(c, tags)
}

func (w WordCloudTagController) Detail(c *gin.Context) {
	tagIdStr := c.Param("tag_id")
	tagId, err := strconv.ParseUint(tagIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid tag_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var tag model.WordCloudTag
	if err := database.DB.Where("id = ? AND user_id = ?", tagId, userId).First(&tag).Error; err != nil {
		logger.Logger.Error("get word cloud tag detail failed", zap.Uint("UserId", userId), zap.Uint64("TagID", tagId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get word cloud tag detail")
		return
	}

	response.Success(c, tag)
}

func (w WordCloudTagController) Edit(c *gin.Context) {
	var req EditWordCloudTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse word cloud tag request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var tag model.WordCloudTag
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&tag).Error; err != nil {
		logger.Logger.Error("edit word cloud tag failed", zap.Uint("UserId", userId), zap.Uint("TagID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit word cloud tag")
		return
	}

	if tag.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.WordCloudTag.Text != "" {
		updateColumn["text"] = req.WordCloudTag.Text
	}
	if req.WordCloudTag.Category != "" {
		updateColumn["category"] = req.WordCloudTag.Category
	}
	if req.WordCloudTag.Weight != 0 {
		updateColumn["weight"] = req.WordCloudTag.Weight
	}
	if req.WordCloudTag.Color != "" {
		updateColumn["color"] = req.WordCloudTag.Color
	}

	if err := database.DB.Model(&model.WordCloudTag{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit word cloud tag failed",
			zap.Uint("TagID", req.ID),
			zap.String("text", req.WordCloudTag.Text),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit word cloud tag")
		return
	}

	response.Success(c, nil)
}

func (w WordCloudTagController) Delete(c *gin.Context) {
	var req DeleteWordCloudTagReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse word cloud tag request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var tag model.WordCloudTag
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&tag)
	if result.Error != nil {
		logger.Logger.Error("delete word cloud tag failed",
			zap.Uint("UserId", userId),
			zap.Uint("tagID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Word cloud tag not found")
		return
	}

	if result.RowsAffected == 0 || tag.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.WordCloudTag{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete word cloud tag failed", zap.Uint("TagID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete word cloud tag")
		return
	}

	response.Success(c, nil)
}
