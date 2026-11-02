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

type CreateWorkExperienceReq struct {
	Company      string `json:"company" binding:"required"`
	Role         string `json:"role" binding:"required"`
	Period       string `json:"period" binding:"required"`
	Description  string `json:"description"`
	TechStack    string `json:"techStack"`
	Achievements string `json:"achievements"`
}

type EditWorkExperienceReq struct {
	ID           uint   `json:"id" binding:"required"`
	Company      string `json:"company"`
	Role         string `json:"role"`
	Period       string `json:"period"`
	Description  string `json:"description"`
	TechStack    string `json:"techStack"`
	Achievements string `json:"achievements"`
}

type DeleteWorkExperienceReq struct {
	ID uint `json:"id"`
}

type WorkExperienceController struct{}

func (w WorkExperienceController) CreateWorkExperience(c *gin.Context) {
	var createWorkExperienceReq CreateWorkExperienceReq
	if err := c.ShouldBind(&createWorkExperienceReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	workExperience := model.WorkExperience{
		Company:      createWorkExperienceReq.Company,
		Role:         createWorkExperienceReq.Role,
		Period:       createWorkExperienceReq.Period,
		Description:  createWorkExperienceReq.Description,
		TechStack:    createWorkExperienceReq.TechStack,
		Achievements: createWorkExperienceReq.Achievements,
		UserID:       userId,
	}

	if err := database.DB.Create(&workExperience).Error; err != nil {
		logger.Logger.Error("Failed to create work experience", 
			zap.String("company", createWorkExperienceReq.Company), 
			zap.String("role", createWorkExperienceReq.Role), 
			zap.Uint("userId", userId), 
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to insert work experience")
		return
	}

	response.Success(c, workExperience)
}

func (w WorkExperienceController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var workExperiences []model.WorkExperience
	if err := database.DB.Where("user_id = ?", userId).Find(&workExperiences).Error; err != nil {
		logger.Logger.Error("work experience list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list work experiences")
		return
	}

	response.Success(c, workExperiences)
}

func (w WorkExperienceController) PublicList(c *gin.Context) {
	var workExperiences []model.WorkExperience
	if err := database.DB.Find(&workExperiences).Error; err != nil {
		logger.Logger.Error("public work experience list failed", zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list work experiences")
		return
	}

	response.Success(c, workExperiences)
}

func (w WorkExperienceController) Edit(c *gin.Context) {
	var req EditWorkExperienceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse work experience request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var workExperience model.WorkExperience
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&workExperience).Error; err != nil {
		logger.Logger.Error("edit work experience failed", 
			zap.Uint("UserId", userId), 
			zap.Uint("ID", req.ID), 
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit work experience")
		return
	}
	if workExperience.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Company != "" {
		updateColumn["company"] = req.Company
	}
	if req.Role != "" {
		updateColumn["role"] = req.Role
	}
	if req.Period != "" {
		updateColumn["period"] = req.Period
	}
	if req.Description != "" {
		updateColumn["description"] = req.Description
	}
	if req.TechStack != "" {
		updateColumn["tech_stack"] = req.TechStack
	}
	if req.Achievements != "" {
		updateColumn["achievements"] = req.Achievements
	}

	if err := database.DB.Model(&model.WorkExperience{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit work experience failed",
			zap.Uint("ID", req.ID),
			zap.String("company", req.Company),
			zap.String("role", req.Role),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit work experience")
		return
	}

	response.Success(c, nil)
}

func (w WorkExperienceController) Delete(c *gin.Context) {
	var req DeleteWorkExperienceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse work experience request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var workExperience model.WorkExperience
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&workExperience).Error; err != nil {
		logger.Logger.Error("delete work experience failed",
			zap.Uint("UserId", userId),
			zap.Uint("ID", req.ID),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete work experience")
		return
	}

	if workExperience.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}
	if err := database.DB.Model(&model.WorkExperience{}).Delete(&model.WorkExperience{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete work experience failed", zap.Uint("ID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete work experience")
		return
	}

	response.Success(c, nil)
}
