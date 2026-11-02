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

type CreateVisitedCityReq struct {
	Name            string  `json:"name" binding:"required"`
	Lat             float64 `json:"lat" binding:"required"`
	Lng             float64 `json:"lng" binding:"required"`
	Visited         bool    `json:"visited"`
	Year            int     `json:"year" binding:"required"`
	IsInternational bool    `json:"is_international"`
}

type EditVisitedCityReq struct {
	ID          uint              `json:"id" binding:"required"`
	VisitedCity model.VisitedCity `json:"visited_city"`
}

type DeleteVisitedCityReq struct {
	ID uint `json:"id"`
}

type VisitedCityController struct{}

func (v VisitedCityController) Create(c *gin.Context) {
	var req CreateVisitedCityReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	city := model.VisitedCity{
		Name:            req.Name,
		Lat:             req.Lat,
		Lng:             req.Lng,
		Visited:         req.Visited,
		Year:            req.Year,
		IsInternational: req.IsInternational,
		UserID:          userId,
	}

	if err := database.DB.Create(&city).Error; err != nil {
		logger.Logger.Error("Failed to create visited city", zap.String("name", req.Name), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create visited city")
		return
	}

	response.Success(c, city)
}

func (v VisitedCityController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var cities []model.VisitedCity
	if err := database.DB.Where("user_id = ?", userId).Order("year DESC").Find(&cities).Error; err != nil {
		logger.Logger.Error("visited city list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list visited cities")
		return
	}

	response.Success(c, cities)
}

func (v VisitedCityController) Detail(c *gin.Context) {
	cityIdStr := c.Param("city_id")
	cityId, err := strconv.ParseUint(cityIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid city_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var city model.VisitedCity
	if err := database.DB.Where("id = ? AND user_id = ?", cityId, userId).First(&city).Error; err != nil {
		logger.Logger.Error("get visited city detail failed", zap.Uint("UserId", userId), zap.Uint64("CityID", cityId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get visited city detail")
		return
	}

	response.Success(c, city)
}

func (v VisitedCityController) Edit(c *gin.Context) {
	var req EditVisitedCityReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse visited city request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var city model.VisitedCity
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&city).Error; err != nil {
		logger.Logger.Error("edit visited city failed", zap.Uint("UserId", userId), zap.Uint("CityID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit visited city")
		return
	}

	if city.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.VisitedCity.Name != "" {
		updateColumn["name"] = req.VisitedCity.Name
	}
	if req.VisitedCity.Lat != 0 {
		updateColumn["lat"] = req.VisitedCity.Lat
	}
	if req.VisitedCity.Lng != 0 {
		updateColumn["lng"] = req.VisitedCity.Lng
	}
	if req.VisitedCity.Year != 0 {
		updateColumn["year"] = req.VisitedCity.Year
	}
	updateColumn["visited"] = req.VisitedCity.Visited
	updateColumn["is_international"] = req.VisitedCity.IsInternational

	if err := database.DB.Model(&model.VisitedCity{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit visited city failed",
			zap.Uint("CityID", req.ID),
			zap.String("name", req.VisitedCity.Name),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit visited city")
		return
	}

	response.Success(c, nil)
}

func (v VisitedCityController) Delete(c *gin.Context) {
	var req DeleteVisitedCityReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse visited city request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var city model.VisitedCity
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&city)
	if result.Error != nil {
		logger.Logger.Error("delete visited city failed",
			zap.Uint("UserId", userId),
			zap.Uint("cityID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "City not found")
		return
	}

	if result.RowsAffected == 0 || city.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.VisitedCity{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete visited city failed", zap.Uint("CityID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete visited city")
		return
	}

	response.Success(c, nil)
}
