package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/logger"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"net/http"
	"strconv"
)

type CreateMomentReq struct {
	Content  string   `json:"content"`
	Images   []string `json:"images"`
	Location string   `json:"location"`
}

type EditMomentReq struct {
	ID     uint           `json:"id" binding:"required"`
	Moment model.Moment `json:"moment"`
}

type DeleteMomentReq struct {
	ID uint `json:"id"`
}

type LikeMomentReq struct {
	ID uint `json:"id"`
}

type MomentController struct{}

func (m MomentController) Create(c *gin.Context) {
	var req CreateMomentReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	imagesJSON, _ := json.Marshal(req.Images)

	moment := model.Moment{
		Content:  req.Content,
		Images:   string(imagesJSON),
		Location: req.Location,
		Likes:    0,
		Comments: 0,
		UserID:   userId,
	}

	if err := database.DB.Create(&moment).Error; err != nil {
		logger.Logger.Error("Failed to create moment", zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create moment")
		return
	}

	response.Success(c, moment)
}

func (m MomentController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var moments []model.Moment
	if err := database.DB.Where("user_id = ?", userId).Order("created_at DESC").Find(&moments).Error; err != nil {
		logger.Logger.Error("moment list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list moments")
		return
	}

	response.Success(c, moments)
}

func (m MomentController) Detail(c *gin.Context) {
	momentIdStr := c.Param("moment_id")
	momentId, err := strconv.ParseUint(momentIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid moment_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var moment model.Moment
	if err := database.DB.Where("id = ? AND user_id = ?", momentId, userId).First(&moment).Error; err != nil {
		logger.Logger.Error("get moment detail failed", zap.Uint("UserId", userId), zap.Uint64("MomentID", momentId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get moment detail")
		return
	}

	response.Success(c, moment)
}

func (m MomentController) Edit(c *gin.Context) {
	var req EditMomentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse moment request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var moment model.Moment
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&moment).Error; err != nil {
		logger.Logger.Error("edit moment failed", zap.Uint("UserId", userId), zap.Uint("MomentID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit moment")
		return
	}

	if moment.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Moment.Content != "" {
		updateColumn["content"] = req.Moment.Content
	}
	if req.Moment.Images != "" {
		updateColumn["images"] = req.Moment.Images
	}
	if req.Moment.Location != "" {
		updateColumn["location"] = req.Moment.Location
	}

	if err := database.DB.Model(&model.Moment{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit moment failed",
			zap.Uint("MomentID", req.ID),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit moment")
		return
	}

	response.Success(c, nil)
}

func (m MomentController) Delete(c *gin.Context) {
	var req DeleteMomentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse moment request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var moment model.Moment
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&moment)
	if result.Error != nil {
		logger.Logger.Error("delete moment failed",
			zap.Uint("UserId", userId),
			zap.Uint("momentID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Moment not found")
		return
	}

	if result.RowsAffected == 0 || moment.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.Moment{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete moment failed", zap.Uint("MomentID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete moment")
		return
	}

	response.Success(c, nil)
}

func (m MomentController) Like(c *gin.Context) {
	var req LikeMomentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse like moment request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var moment model.Moment
	if err := database.DB.Where("id = ?", req.ID).First(&moment).Error; err != nil {
		logger.Logger.Error("like moment failed", zap.Uint("momentID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusNotFound, -1, "Moment not found")
		return
	}

	if err := database.DB.Model(&model.Moment{}).Where("id = ?", req.ID).Update("likes", moment.Likes+1).Error; err != nil {
		logger.Logger.Error("like moment failed", zap.Uint("MomentID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to like moment")
		return
	}

	response.Success(c, gin.H{"likes": moment.Likes + 1})
}
