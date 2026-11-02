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

type CreateLifeTimeAllocationReq struct {
	Category     string  `json:"category" binding:"required"`
	Year         int     `json:"year"`
	Month        int     `json:"month"`
	HoursPerDay  float64 `json:"hours_per_day" binding:"required"`
	HoursPerWeek float64 `json:"hours_per_week" binding:"required"`
	Percentage   float64 `json:"percentage" binding:"required"`
	Color        string  `json:"color" binding:"required"`
}

type EditLifeTimeAllocationReq struct {
	ID                 uint                     `json:"id" binding:"required"`
	LifeTimeAllocation model.LifeTimeAllocation `json:"life_time_allocation" binding:"required"`
}

type DeleteLifeTimeAllocationReq struct {
	ID uint `json:"id"`
}

type LifeTimeAllocationController struct{}

func (l LifeTimeAllocationController) Create(c *gin.Context) {
	var req CreateLifeTimeAllocationReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	allocation := model.LifeTimeAllocation{
		Category:     req.Category,
		Year:         req.Year,
		Month:        req.Month,
		HoursPerDay:  req.HoursPerDay,
		HoursPerWeek: req.HoursPerWeek,
		Percentage:   req.Percentage,
		Color:        req.Color,
		UserID:       userId,
	}

	if err := database.DB.Create(&allocation).Error; err != nil {
		logger.Logger.Error("Failed to create life time allocation", zap.String("category", req.Category), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create life time allocation")
		return
	}

	response.Success(c, allocation)
}

func (l LifeTimeAllocationController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var allocations []model.LifeTimeAllocation
	if err := database.DB.Where("user_id = ?", userId).Find(&allocations).Error; err != nil {
		logger.Logger.Error("life time allocation list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list life time allocations")
		return
	}

	response.Success(c, allocations)
}

func (l LifeTimeAllocationController) Detail(c *gin.Context) {
	allocationIdStr := c.Param("allocation_id")
	allocationId, err := strconv.ParseUint(allocationIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid allocation_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var allocation model.LifeTimeAllocation
	if err := database.DB.Where("id = ? AND user_id = ?", allocationId, userId).First(&allocation).Error; err != nil {
		logger.Logger.Error("get life time allocation detail failed", zap.Uint("UserId", userId), zap.Uint64("AllocationID", allocationId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get life time allocation detail")
		return
	}

	response.Success(c, allocation)
}

func (l LifeTimeAllocationController) Edit(c *gin.Context) {
	var req EditLifeTimeAllocationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse life time allocation request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var allocation model.LifeTimeAllocation
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&allocation).Error; err != nil {
		logger.Logger.Error("edit life time allocation failed", zap.Uint("UserId", userId), zap.Uint("AllocationID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit life time allocation")
		return
	}

	if allocation.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.LifeTimeAllocation.Category != "" {
		updateColumn["category"] = req.LifeTimeAllocation.Category
	}
	if req.LifeTimeAllocation.Year != 0 {
		updateColumn["year"] = req.LifeTimeAllocation.Year
	}
	if req.LifeTimeAllocation.Month != 0 {
		updateColumn["month"] = req.LifeTimeAllocation.Month
	}
	if req.LifeTimeAllocation.HoursPerDay != 0 {
		updateColumn["hours_per_day"] = req.LifeTimeAllocation.HoursPerDay
	}
	if req.LifeTimeAllocation.HoursPerWeek != 0 {
		updateColumn["hours_per_week"] = req.LifeTimeAllocation.HoursPerWeek
	}
	if req.LifeTimeAllocation.Percentage != 0 {
		updateColumn["percentage"] = req.LifeTimeAllocation.Percentage
	}
	if req.LifeTimeAllocation.Color != "" {
		updateColumn["color"] = req.LifeTimeAllocation.Color
	}

	if err := database.DB.Model(&model.LifeTimeAllocation{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit life time allocation failed",
			zap.Uint("AllocationID", req.ID),
			zap.String("category", req.LifeTimeAllocation.Category),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit life time allocation")
		return
	}

	response.Success(c, nil)
}

func (l LifeTimeAllocationController) Delete(c *gin.Context) {
	var req DeleteLifeTimeAllocationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse life time allocation request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var allocation model.LifeTimeAllocation
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&allocation)
	if result.Error != nil {
		logger.Logger.Error("delete life time allocation failed",
			zap.Uint("UserId", userId),
			zap.Uint("allocationID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Life time allocation not found")
		return
	}

	if result.RowsAffected == 0 || allocation.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.LifeTimeAllocation{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete life time allocation failed", zap.Uint("AllocationID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete life time allocation")
		return
	}

	response.Success(c, nil)
}

type YearMonthReq struct {
	Year  int `json:"year"`
	Month int `json:"month"`
}

func (l LifeTimeAllocationController) ListByYear(c *gin.Context) {
	var req YearMonthReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var allocations []model.LifeTimeAllocation
	query := database.DB.Where("user_id = ?", userId)

	if req.Year > 0 {
		query = query.Where("year = ?", req.Year)
	}

	if err := query.Order("category, year, month").Find(&allocations).Error; err != nil {
		logger.Logger.Error("life time allocation list by year failed", zap.Uint("userId", userId), zap.Int("year", req.Year), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list life time allocations")
		return
	}

	response.Success(c, allocations)
}

func (l LifeTimeAllocationController) ListByMonth(c *gin.Context) {
	var req YearMonthReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var allocations []model.LifeTimeAllocation
	query := database.DB.Where("user_id = ?", userId)

	if req.Year > 0 {
		query = query.Where("year = ?", req.Year)
	}
	if req.Month > 0 {
		query = query.Where("month = ?", req.Month)
	}

	if err := query.Order("category, year, month").Find(&allocations).Error; err != nil {
		logger.Logger.Error("life time allocation list by month failed", zap.Uint("userId", userId), zap.Int("year", req.Year), zap.Int("month", req.Month), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list life time allocations")
		return
	}

	response.Success(c, allocations)
}

func (l LifeTimeAllocationController) GetYearList(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var years []int
	if err := database.DB.Model(&model.LifeTimeAllocation{}).
		Where("user_id = ? AND year > 0", userId).
		Distinct("year").
		Order("year DESC").
		Pluck("year", &years).Error; err != nil {
		logger.Logger.Error("get year list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get year list")
		return
	}

	response.Success(c, years)
}
