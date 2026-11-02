package controllers

import (
	"net/http"

	"blog-management/internal/response"
	"blog-management/internal/steam"
	"blog-management/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type SteamController struct{}

type SteamRefreshResponse struct {
	Success     bool   `json:"success"`
	Message     string `json:"message"`
	HasRealData bool   `json:"has_real_data"`
}

type TestSteamConnectionReq struct {
	SteamAPIKey string `json:"steamAPIKey"`
	SteamID     string `json:"steamID"`
}

func (s SteamController) GetSummary(c *gin.Context) {
	service := steam.GetSteamService()
	summary, err := service.GetSteamSummaryForPublic()

	if err != nil {
		logger.Logger.Error("Failed to get public steam summary", zap.Error(err))
		response.Success(c, gin.H{
			"has_real_data": false,
		})
		return
	}

	if summary == nil {
		logger.Logger.Info("No steam configuration found, returning empty summary")
		response.Success(c, gin.H{
			"has_real_data": false,
		})
		return
	}

	response.Success(c, summary)
}

func (s SteamController) Refresh(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusUnauthorized, -1, "token is invalid")
		return
	}

	service := steam.GetSteamService()
	summary, err := service.GetSteamSummary(userId, true)

	if err != nil {
		logger.Logger.Error("Failed to refresh steam data", zap.Uint("userID", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to refresh steam data: "+err.Error())
		return
	}

	if summary == nil {
		response.Success(c, SteamRefreshResponse{
			Success:    true,
			Message:    "Steam API Key or Steam ID not configured",
			HasRealData: false,
		})
		return
	}

	response.Success(c, SteamRefreshResponse{
		Success:    true,
		Message:    "Steam data refreshed successfully",
		HasRealData: true,
	})
}

func (s SteamController) TestConnection(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusUnauthorized, -1, "token is invalid")
		return
	}

	var req TestSteamConnectionReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("Failed to parse test steam connection request", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, "Invalid request: "+err.Error())
		return
	}

	if req.SteamAPIKey == "" || req.SteamID == "" {
		response.Fail(c, http.StatusBadRequest, -1, "Steam API Key and Steam ID are required")
		return
	}

	logger.Logger.Info("Testing steam connection", zap.Uint("userID", userId), zap.String("steamID", req.SteamID))

	client := steam.NewSteamClient(req.SteamAPIKey)
	summary, err := client.GetSteamSummary(req.SteamID)

	if err != nil {
		logger.Logger.Error("Steam connection test failed", zap.Uint("userID", userId), zap.String("steamID", req.SteamID), zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, "Connection failed: "+err.Error())
		return
	}

	logger.Logger.Info("Steam connection test successful",
		zap.Uint("userID", userId),
		zap.String("steamID", req.SteamID),
		zap.String("personaName", summary.UserInfo.PersonaName),
		zap.Int("totalGames", summary.TotalGames),
		zap.Int("totalPlaytimeHours", summary.TotalPlaytime))

	response.Success(c, gin.H{
		"success":      true,
		"message":      "Connection successful",
		"persona_name": summary.UserInfo.PersonaName,
		"total_games":  summary.TotalGames,
		"playtime":     summary.TotalPlaytime,
	})
}
