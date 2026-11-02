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

type CreatePostReq struct {
	Title    string `json:"title" binding:"required"`
	Excerpt  string `json:"excerpt"`
	Content  string `json:"content" binding:"required"`
	Tags     string `json:"tags"`
	Category string `json:"category"`
	Featured bool   `json:"featured"`
}

type EditPostReq struct {
	ID       uint   `json:"id" binding:"required"`
	Title    string `json:"title"`
	Excerpt  string `json:"excerpt"`
	Content  string `json:"content"`
	Tags     string `json:"tags"`
	Category string `json:"category"`
	Featured bool   `json:"featured"`
}

type DeletePostReq struct {
	ID uint `json:"id"`
}

type PostController struct{}

func (p PostController) CreatPost(c *gin.Context) {
	var createPostReq CreatePostReq
	if err := c.ShouldBind(&createPostReq); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}
	post := model.Post{
		Title:    createPostReq.Title,
		Excerpt:  createPostReq.Excerpt,
		Content:  createPostReq.Content,
		Tags:     createPostReq.Tags,
		Category: createPostReq.Category,
		Featured: createPostReq.Featured,
		Views:    0,
		UserID:   userId,
	}

	//	将post写入数据库中
	if err := database.DB.Create(&post).Error; err != nil {
		logger.Logger.Error("Failed to create post", zap.String("title", createPostReq.Title), zap.String("content", createPostReq.Content), zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to insert post")
		return
	}

	response.Success(c, post)
}

func (p PostController) List(c *gin.Context) {
	// 获取当前用户的文章列表
	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var posts []model.Post
	if err := database.DB.Where("user_id = ?", userId).Find(&posts).Error; err != nil {
		logger.Logger.Error("post list failed", zap.Uint("userId", userId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to list posts")
		return
	}

	response.Success(c, posts)
}

func (p PostController) Detail(c *gin.Context) {
	postIdStr := c.Param("post_id")
	postId, err := strconv.ParseUint(postIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "invalid post_id")
		return
	}

	var post model.Post
	if err := database.DB.Where("id = ?", postId).First(&post).Error; err != nil {
		logger.Logger.Error("get post detail failed", zap.Uint64("PostID", postId), zap.Error(err))
		response.Fail(c, http.StatusNotFound, -1, "Post not found")
		return
	}

	database.DB.Model(&post).Update("views", post.Views+1)
	post.Views++

	var comments []model.Comment
	if err := database.DB.Where("post_id = ?", postId).Find(&comments).Error; err != nil {
		logger.Logger.Error("get post comments failed", zap.Uint64("PostID", postId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to get post comments")
		return
	}

	for i := range comments {
		var user model.User
		if err := database.DB.Select("username, avatar").Where("id = ?", comments[i].UserID).First(&user).Error; err == nil {
			comments[i].Username = user.Username
			comments[i].Avatar = user.Avatar
		}
	}

	response.Success(c, struct {
		model.Post
		Comments []model.Comment `json:"comments"`
	}{
		post,
		comments,
	})
}

func (p PostController) Edit(c *gin.Context) {
	//	修改文章内容
	var req EditPostReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse post request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	//	先查出 userid postid 对应的文章
	var post model.Post
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&post).Error; err != nil {
		logger.Logger.Error("edit post failed", zap.Uint("UserId", userId), zap.Uint("PostID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit post")
		return
	}
	if post.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}

	// 修改相关文章
	updateColumn := make(map[string]interface{})
	if req.Title != "" {
		updateColumn["title"] = req.Title
	}
	if req.Excerpt != "" {
		updateColumn["excerpt"] = req.Excerpt
	}
	if req.Content != "" {
		updateColumn["content"] = req.Content
	}
	if req.Tags != "" {
		updateColumn["tags"] = req.Tags
	}
	if req.Category != "" {
		updateColumn["category"] = req.Category
	}
	updateColumn["featured"] = req.Featured

	if err := database.DB.Model(&model.Post{}).Where("id = ?", req.ID).Updates(updateColumn).Error; err != nil {
		logger.Logger.Error("edit post failed",
			zap.Uint("PostID", req.ID),
			zap.String("title", req.Title),
			zap.String("content", req.Content),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to edit post")
		return
	}

	response.Success(c, nil)
}

func (p PostController) Delete(c *gin.Context) {
	var req DeletePostReq
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Error("parse post request failed", zap.Error(err))
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	userId := c.GetUint("userID")
	if userId == 0 {
		response.Fail(c, http.StatusBadRequest, -1, "token is invalid")
		return
	}

	var post model.Post
	if err := database.DB.Where("id = ? AND user_id = ?", req.ID, userId).First(&post).Error; err != nil {
		logger.Logger.Error("delete post failed",
			zap.Uint("UserId", userId),
			zap.Uint("postID", req.ID),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete post")
		return
	}

	if post.ID == 0 {
		response.Fail(c, http.StatusForbidden, -1, "auth forbidden")
		return
	}
	if err := database.DB.Model(&model.Post{}).Delete(&model.Post{}, req.ID).Error; err != nil {
		logger.Logger.Error("delete post failed", zap.Uint("PostID", req.ID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to delete post")
		return
	}

	response.Success(c, nil)
}
