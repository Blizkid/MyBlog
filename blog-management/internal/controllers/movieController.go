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

type CreateMovieReq struct {
	Title       string  `json:"title" binding:"required"`
	Genre       string  `json:"genre" binding:"required"`
	Rating      float64 `json:"rating" binding:"required"`
	Poster      string  `json:"poster" binding:"required"`
	Description string  `json:"description" binding:"required"`
}

type EditMovieReq struct {
	ID    uint        `json:"id" binding:"required"`
	Movie model.Movie `json:"movie" binding:"required"`
}

type DeleteMovieReq struct {
	ID uint `json:"id"`
}

type MovieController struct{}

func (m MovieController) Create(c *gin.Context) {
	var req CreateMovieReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	movie := model.Movie{
		Title:       req.Title,
		Genre:       req.Genre,
		Rating:      req.Rating,
		Poster:      req.Poster,
		Description: req.Description,
		UserID:      userId,
	}

	if err := database.DB.Create(&movie).Error; err != nil {
		logger.Logger.Error("Failed to create movie", zap.String("title", req.Title), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create movie")
		return
	}

	response.Success(c, movie)
}

func (m MovieController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var movies []model.Movie
	if err := database.DB.Where("user_id = ?", userId).Find(&movies).Error; err != nil {
		logger.Logger.Error("movie list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list movies")
		return
	}

	response.Success(c, movies)
}

func (m MovieController) Detail(c *gin.Context) {
	movieIdStr := c.Param("movie_id")
	movieId, err := strconv.ParseUint(movieIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid movie_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var movie model.Movie
	if err := database.DB.Where("id = ? AND user_id = ?", movieId, userId).First(&movie).Error; err != nil {
		logger.Logger.Error("get movie detail failed", zap.Uint("UserId", userId), zap.Uint64("MovieID", movieId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get movie detail")
		return
	}

	response.Success(c, movie)
}

func (m MovieController) Edit(c *gin.Context) {
	var req EditMovieReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse movie request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var movie model.Movie
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&movie).Error; err != nil {
		logger.Logger.Error("edit movie failed", zap.Uint("UserId", userId), zap.Uint("MovieID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit movie")
		return
	}

	if movie.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Movie.Title != "" {
		updateColumn["title"] = req.Movie.Title
	}
	if req.Movie.Genre != "" {
		updateColumn["genre"] = req.Movie.Genre
	}
	if req.Movie.Rating != 0 {
		updateColumn["rating"] = req.Movie.Rating
	}
	if req.Movie.Poster != "" {
		updateColumn["poster"] = req.Movie.Poster
	}
	if req.Movie.Description != "" {
		updateColumn["description"] = req.Movie.Description
	}

	if err := database.DB.Model(&model.Movie{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit movie failed",
			zap.Uint("MovieID", req.ID),
			zap.String("title", req.Movie.Title),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit movie")
		return
	}

	response.Success(c, nil)
}

func (m MovieController) Delete(c *gin.Context) {
	var req DeleteMovieReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse movie request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var movie model.Movie
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&movie)
	if result.Error != nil {
		logger.Logger.Error("delete movie failed",
			zap.Uint("UserId", userId),
			zap.Uint("movieID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Movie not found")
		return
	}

	if result.RowsAffected == 0 || movie.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.Movie{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete movie failed", zap.Uint("MovieID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete movie")
		return
	}

	response.Success(c, nil)
}
