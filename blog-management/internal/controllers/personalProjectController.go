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

type CreatePersonalProjectReq struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	TechStack   string `json:"techStack"`
	Github      string `json:"github"`
	Demo        string `json:"demo"`
	Status      string `json:"status"`
	Stars       uint   `json:"stars"`
	Commits     uint   `json:"commits"`
	Tags        string `json:"tags"`
}

type EditPersonalProjectReq struct {
	ID          uint   `json:"id" binding:"required"`
	Name        string `json:"name"`
	Description string `json:"description"`
	TechStack   string `json:"techStack"`
	Github      string `json:"github"`
	Demo        string `json:"demo"`
	Status      string `json:"status"`
	Stars       uint   `json:"stars"`
	Commits     uint   `json:"commits"`
	Tags        string `json:"tags"`
}

type DeletePersonalProjectReq struct {
	ID uint `json:"id"`
}

type PersonalProjectController struct{}

func (p PersonalProjectController) CreatePersonalProject(c *gin.Context) {
	var createPersonalProjectReq CreatePersonalProjectReq
	if err := c.ShouldBind(&createPersonalProjectReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	personalProject := model.PersonalProject{
		Name:        createPersonalProjectReq.Name,
		Description: createPersonalProjectReq.Description,
		TechStack:   createPersonalProjectReq.TechStack,
		Github:      createPersonalProjectReq.Github,
		Demo:        createPersonalProjectReq.Demo,
		Status:      createPersonalProjectReq.Status,
		Stars:       createPersonalProjectReq.Stars,
		Commits:     createPersonalProjectReq.Commits,
		Tags:        createPersonalProjectReq.Tags,
		UserID:      userId,
	}

	if err := database.DB.Create(&personalProject).Error; err != nil {
		logger.Logger.Error("Failed to create personal project", 
			zap.String("name", createPersonalProjectReq.Name), 
			zap.Uint("userId", userId), 
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to insert personal project")
		return
	}

	response.Success(c, personalProject)
}

func (p PersonalProjectController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var personalProjects []model.PersonalProject
	if err := database.DB.Where("user_id = ?", userId).Find(&personalProjects).Error; err != nil {
		logger.Logger.Error("personal project list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list personal projects")
		return
	}

	response.Success(c, personalProjects)
}

func (p PersonalProjectController) PublicList(c *gin.Context) {
	var personalProjects []model.PersonalProject
	if err := database.DB.Find(&personalProjects).Error; err != nil {
		logger.Logger.Error("public personal project list failed", zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list personal projects")
		return
	}

	response.Success(c, personalProjects)
}

func (p PersonalProjectController) Edit(c *gin.Context) {
	var req EditPersonalProjectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse personal project request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var personalProject model.PersonalProject
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&personalProject).Error; err != nil {
		logger.Logger.Error("edit personal project failed", 
			zap.Uint("UserId", userId), 
			zap.Uint("ID", req.ID), 
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit personal project")
		return
	}
	if personalProject.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Name != "" {
		updateColumn["name"] = req.Name
	}
	if req.Description != "" {
		updateColumn["description"] = req.Description
	}
	if req.TechStack != "" {
		updateColumn["tech_stack"] = req.TechStack
	}
	if req.Github != "" {
		updateColumn["github"] = req.Github
	}
	if req.Demo != "" {
		updateColumn["demo"] = req.Demo
	}
	if req.Status != "" {
		updateColumn["status"] = req.Status
	}
	if req.Stars > 0 {
		updateColumn["stars"] = req.Stars
	}
	if req.Commits > 0 {
		updateColumn["commits"] = req.Commits
	}
	if req.Tags != "" {
		updateColumn["tags"] = req.Tags
	}

	if err := database.DB.Model(&model.PersonalProject{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit personal project failed",
			zap.Uint("ID", req.ID),
			zap.String("name", req.Name),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit personal project")
		return
	}

	response.Success(c, nil)
}

func (p PersonalProjectController) Delete(c *gin.Context) {
	var req DeletePersonalProjectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse personal project request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var personalProject model.PersonalProject
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&personalProject).Error; err != nil {
		logger.Logger.Error("delete personal project failed",
			zap.Uint("UserId", userId),
			zap.Uint("ID", req.ID),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete personal project")
		return
	}

	if personalProject.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}
	if err := database.DB.Model(&model.PersonalProject{}).Delete(&model.PersonalProject{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete personal project failed", zap.Uint("ID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete personal project")
		return
	}

	response.Success(c, nil)
}
