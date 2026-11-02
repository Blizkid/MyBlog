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

type CreateFavoriteGameReq struct {
	Name        string   `json:"name" binding:"required"`
	Genre       string   `json:"genre" binding:"required"`
	Hours       *int     `json:"hours" binding:"required"`
	Rating      *float64 `json:"rating" binding:"required"`
	Poster      string   `json:"poster" binding:"required"`
	Description string   `json:"description" binding:"required"`
}

type EditFavoriteGameReq struct {
	ID           uint               `json:"id" binding:"required"`
	FavoriteGame model.FavoriteGame `json:"favorite_game" binding:"required"`
}

type DeleteFavoriteGameReq struct {
	ID uint `json:"id"`
}

type FavoriteGameController struct{}

func (f FavoriteGameController) Create(c *gin.Context) {
	var req CreateFavoriteGameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse create favorite game request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	game := model.FavoriteGame{
		Name:        req.Name,
		Genre:       req.Genre,
		Hours:       *req.Hours,
		Rating:      *req.Rating,
		Poster:      req.Poster,
		Description: req.Description,
		UserID:      userId,
	}

	if err := database.DB.Create(&game).Error; err != nil {
		logger.Logger.Error("Failed to create favorite game", zap.String("name", req.Name), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create favorite game")
		return
	}

	response.Success(c, game)
}

func (f FavoriteGameController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var games []model.FavoriteGame
	if err := database.DB.Where("user_id = ?", userId).Find(&games).Error; err != nil {
		logger.Logger.Error("favorite game list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list favorite games")
		return
	}

	response.Success(c, games)
}

func (f FavoriteGameController) Detail(c *gin.Context) {
	gameIdStr := c.Param("game_id")
	gameId, err := strconv.ParseUint(gameIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid game_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var game model.FavoriteGame
	if err := database.DB.Where("id = ? AND user_id = ?", gameId, userId).First(&game).Error; err != nil {
		logger.Logger.Error("get favorite game detail failed", zap.Uint("UserId", userId), zap.Uint64("GameID", gameId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get favorite game detail")
		return
	}

	response.Success(c, game)
}

func (f FavoriteGameController) Edit(c *gin.Context) {
	var req EditFavoriteGameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse favorite game request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var game model.FavoriteGame
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&game).Error; err != nil {
		logger.Logger.Error("edit favorite game failed", zap.Uint("UserId", userId), zap.Uint("GameID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit favorite game")
		return
	}

	if game.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.FavoriteGame.Name != "" {
		updateColumn["name"] = req.FavoriteGame.Name
	}
	if req.FavoriteGame.Genre != "" {
		updateColumn["genre"] = req.FavoriteGame.Genre
	}
	if req.FavoriteGame.Hours != 0 {
		updateColumn["hours"] = req.FavoriteGame.Hours
	}
	if req.FavoriteGame.Rating != 0 {
		updateColumn["rating"] = req.FavoriteGame.Rating
	}
	if req.FavoriteGame.Poster != "" {
		updateColumn["poster"] = req.FavoriteGame.Poster
	}
	if req.FavoriteGame.Description != "" {
		updateColumn["description"] = req.FavoriteGame.Description
	}

	if err := database.DB.Model(&model.FavoriteGame{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit favorite game failed",
			zap.Uint("GameID", req.ID),
			zap.String("name", req.FavoriteGame.Name),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit favorite game")
		return
	}

	response.Success(c, nil)
}

func (f FavoriteGameController) Delete(c *gin.Context) {
	var req DeleteFavoriteGameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse favorite game request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var game model.FavoriteGame
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&game)
	if result.Error != nil {
		logger.Logger.Error("delete favorite game failed",
			zap.Uint("UserId", userId),
			zap.Uint("gameID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Game not found")
		return
	}

	if result.RowsAffected == 0 || game.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.FavoriteGame{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete favorite game failed", zap.Uint("GameID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete favorite game")
		return
	}

	response.Success(c, nil)
}
