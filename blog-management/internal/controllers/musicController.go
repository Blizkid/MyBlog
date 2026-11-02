package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/logger"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CreateMusicReq struct {
	Title    string `json:"title" binding:"required"`
	Artist   string `json:"artist" binding:"required"`
	Genre    string `json:"genre" binding:"required"`
	Cover    string `json:"cover" binding:"required"`
	Audio    string `json:"audio"`
	Favorite bool   `json:"favorite"`
}

type EditMusicReq struct {
	ID    uint        `json:"id" binding:"required"`
	Music model.Music `json:"music" binding:"required"`
}

type DeleteMusicReq struct {
	ID uint `json:"id"`
}

type MusicController struct{}

func (m MusicController) Create(c *gin.Context) {
	var req CreateMusicReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	music := model.Music{
		Title:    req.Title,
		Artist:   req.Artist,
		Genre:    req.Genre,
		Cover:    req.Cover,
		Audio:    req.Audio,
		Favorite: req.Favorite,
		UserID:   userId,
	}

	if err := database.DB.Create(&music).Error; err != nil {
		logger.Logger.Error("Failed to create music", zap.String("title", req.Title), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create music")
		return
	}

	response.Success(c, music)
}

func (m MusicController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var musicList []model.Music
	if err := database.DB.Where("user_id = ?", userId).Find(&musicList).Error; err != nil {
		logger.Logger.Error("music list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list music")
		return
	}

	response.Success(c, musicList)
}

func (m MusicController) Detail(c *gin.Context) {
	musicIdStr := c.Param("music_id")
	musicId, err := strconv.ParseUint(musicIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid music_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var music model.Music
	if err := database.DB.Where("id = ? AND user_id = ?", musicId, userId).First(&music).Error; err != nil {
		logger.Logger.Error("get music detail failed", zap.Uint("UserId", userId), zap.Uint64("MusicID", musicId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get music detail")
		return
	}

	response.Success(c, music)
}

func (m MusicController) Edit(c *gin.Context) {
	var req EditMusicReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse music request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var music model.Music
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&music).Error; err != nil {
		logger.Logger.Error("edit music failed", zap.Uint("UserId", userId), zap.Uint("MusicID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit music")
		return
	}

	if music.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Music.Title != "" {
		updateColumn["title"] = req.Music.Title
	}
	if req.Music.Artist != "" {
		updateColumn["artist"] = req.Music.Artist
	}
	if req.Music.Genre != "" {
		updateColumn["genre"] = req.Music.Genre
	}
	if req.Music.Cover != "" {
		updateColumn["cover"] = req.Music.Cover
	}
	if req.Music.Audio != "" {
		updateColumn["audio"] = req.Music.Audio
	}
	updateColumn["favorite"] = req.Music.Favorite

	if err := database.DB.Model(&model.Music{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit music failed",
			zap.Uint("MusicID", req.ID),
			zap.String("title", req.Music.Title),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit music")
		return
	}

	response.Success(c, nil)
}

func (m MusicController) Delete(c *gin.Context) {
	var req DeleteMusicReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse music request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var music model.Music
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&music)
	if result.Error != nil {
		logger.Logger.Error("delete music failed",
			zap.Uint("UserId", userId),
			zap.Uint("musicID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Music not found")
		return
	}

	if result.RowsAffected == 0 || music.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.Music{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete music failed", zap.Uint("MusicID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete music")
		return
	}

	response.Success(c, nil)
}
