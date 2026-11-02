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

type CreateBookReq struct {
	Title  string  `json:"title" binding:"required"`
	Author string  `json:"author" binding:"required"`
	Genre  string  `json:"genre" binding:"required"`
	Cover  string  `json:"cover" binding:"required"`
	Rating float64 `json:"rating" binding:"required"`
	Status string  `json:"status" binding:"required"`
}

type EditBookReq struct {
	ID   uint       `json:"id" binding:"required"`
	Book model.Book `json:"book" binding:"required"`
}

type DeleteBookReq struct {
	ID uint `json:"id"`
}

type BookController struct{}

func (b BookController) Create(c *gin.Context) {
	var req CreateBookReq
	if err := c.ShouldBind(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	book := model.Book{
		Title:  req.Title,
		Author: req.Author,
		Genre:  req.Genre,
		Cover:  req.Cover,
		Rating: req.Rating,
		Status: req.Status,
		UserID: userId,
	}

	if err := database.DB.Create(&book).Error; err != nil {
		logger.Logger.Error("Failed to create book", zap.String("title", req.Title), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to create book")
		return
	}

	response.Success(c, book)
}

func (b BookController) List(c *gin.Context) {
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var books []model.Book
	if err := database.DB.Where("user_id = ?", userId).Find(&books).Error; err != nil {
		logger.Logger.Error("book list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list books")
		return
	}

	response.Success(c, books)
}

func (b BookController) Detail(c *gin.Context) {
	bookIdStr := c.Param("book_id")
	bookId, err := strconv.ParseUint(bookIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid book_id")
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var book model.Book
	if err := database.DB.Where("id = ? AND user_id = ?", bookId, userId).First(&book).Error; err != nil {
		logger.Logger.Error("get book detail failed", zap.Uint("UserId", userId), zap.Uint64("BookID", bookId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get book detail")
		return
	}

	response.Success(c, book)
}

func (b BookController) Edit(c *gin.Context) {
	var req EditBookReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse book request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var book model.Book
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&book).Error; err != nil {
		logger.Logger.Error("edit book failed", zap.Uint("UserId", userId), zap.Uint("BookID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit book")
		return
	}

	if book.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	updateColumn := make(map[string]interface{})
	if req.Book.Title != "" {
		updateColumn["title"] = req.Book.Title
	}
	if req.Book.Author != "" {
		updateColumn["author"] = req.Book.Author
	}
	if req.Book.Genre != "" {
		updateColumn["genre"] = req.Book.Genre
	}
	if req.Book.Cover != "" {
		updateColumn["cover"] = req.Book.Cover
	}
	if req.Book.Rating != 0 {
		updateColumn["rating"] = req.Book.Rating
	}
	if req.Book.Status != "" {
		updateColumn["status"] = req.Book.Status
	}

	if err := database.DB.Model(&model.Book{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit book failed",
			zap.Uint("BookID", req.ID),
			zap.String("title", req.Book.Title),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit book")
		return
	}

	response.Success(c, nil)
}

func (b BookController) Delete(c *gin.Context) {
	var req DeleteBookReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse book request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var book model.Book
	result := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&book)
	if result.Error != nil {
		logger.Logger.Error("delete book failed",
			zap.Uint("UserId", userId),
			zap.Uint("bookID", req.ID),
			zap.Error(result.Error))
		response.Fail(c, http.StatusNotFound, -1, "Book not found")
		return
	}

	if result.RowsAffected == 0 || book.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	if err := database.DB.Delete(&model.Book{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete book failed", zap.Uint("BookID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete book")
		return
	}

	response.Success(c, nil)
}
