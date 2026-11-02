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

type CreateDevelopedGameReq struct {
	Name      string `json:"name" binding:"required"`
	Status    string `json:"status" binding:"required"`
	Progress  *int   `json:"progress" binding:"required"`
	TechStack string `json:"tech_stack" binding:"required"`
	Poster    string `json:"poster" binding:"required"`
}

type EditDevelopedGameReq struct {
	ID            uint                `json:"id" binding:"required"`
	DevelopedGame model.DevelopedGame `json:"developed_game" binding:"required"`
}

type DeleteDevelopedGameReq struct {
	ID uint `json:"id"`
}

type DevelopedGameController struct{}

func (d DevelopedGameController) Create(c *gin.Context) {
	var req CreateDevelopedGameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse create developed game request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	game := model.DevelopedGame{
		Name:      req.Name,
		Status:    req.Status,
		Progress:  *req.Progress,
		TechStack: req.TechStack,
		Poster:    req.Poster,
		UserID:    userId,
	}

	if err := database.DB.Create(&game).Error; err != nil {
		logger.Logger.Error("Failed to create developed game", zap.String("name", req.Name), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create developed game")
		return
	}

	response.Success(c, game)
}

func (d DevelopedGameController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var games []model.DevelopedGame
	if err := database.DB.Where("user_id = ?", userId).Find(&games).Error; err != nil {
		logger.Logger.Error("developed game list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list developed games")
		return
	}

	response.Success(c, games)
}

func (d DevelopedGameController) Detail(c *gin.Context) {
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

	var game model.DevelopedGame
	if err := database.DB.Where("id = ? AND user_id = ?", gameId, userId).First(&game).Error; err != nil {
		logger.Logger.Error("get developed game detail failed", zap.Uint("UserId", userId), zap.Uint64("GameID", gameId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get developed game detail")
		return
	}

	response.Success(c, game)
}

func (d DevelopedGameController) Edit(c *gin.Context) {
	var req EditDevelopedGameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse developed game request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var game model.DevelopedGame
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&game).Error; err != nil {
		logger.Logger.Error("edit developed game failed", zap.Uint("UserId", userId), zap.Uint("GameID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit developed game")
		return
	}

	if game.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.DevelopedGame.Name != "" {
		updateColumn["name"] = req.DevelopedGame.Name
	}
	if req.DevelopedGame.Status != "" {
		updateColumn["status"] = req.DevelopedGame.Status
	}
	if req.DevelopedGame.Progress != 0 {
		updateColumn["progress"] = req.DevelopedGame.Progress
	}
	if req.DevelopedGame.TechStack != "" {
		updateColumn["tech_stack"] = req.DevelopedGame.TechStack
	}
	if req.DevelopedGame.Poster != "" {
		updateColumn["poster"] = req.DevelopedGame.Poster
	}

	if err := database.DB.Model(&model.DevelopedGame{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit developed game failed",
			zap.Uint("GameID", req.ID),
			zap.String("name", req.DevelopedGame.Name),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit developed game")
		return
	}

	response.Success(c, nil)
}

func (d DevelopedGameController) Delete(c *gin.Context) {
	var req DeleteDevelopedGameReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse developed game request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var game model.DevelopedGame
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&game)
	if result.Error != nil {
		logger.Logger.Error("delete developed game failed",
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

	if err := database.DB.Delete(&model.DevelopedGame{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete developed game failed", zap.Uint("GameID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete developed game")
		return
	}

	response.Success(c, nil)
}
