package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/logger"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

var (
	adjectives = []string{
		"快乐的", "聪明的", "勇敢的", "温柔的", "活泼的", "可爱的",
		"机智的", "优雅的", "神秘的", "阳光的", "帅气的", "美丽的",
		"活泼的", "安静的", "热情的", "冷静的", "幽默的", "正直的",
		"善良的", "真诚的", "乐观的", "自信的", "勤奋的", "细心的",
	}
	nouns = []string{
		"熊猫", "兔子", "猫咪", "狗狗", "小鸟", "海豚",
		"老虎", "狮子", "猴子", "大象", "狐狸", "松鼠",
		"企鹅", "蝴蝶", "蜜蜂", "蜻蜓", "瓢虫", "蜗牛",
		"星星", "月亮", "太阳", "云朵", "彩虹", "流星",
		"玫瑰", "樱花", "向日葵", "薰衣草", "郁金香", "百合",
	}
)

func generateRandomGuestName() string {
	rand.Seed(time.Now().UnixNano())
	adj := adjectives[rand.Intn(len(adjectives))]
	noun := nouns[rand.Intn(len(nouns))]
	num := rand.Intn(10000)
	return fmt.Sprintf("%s%s%d", adj, noun, num)
}

type CreateMomentCommentReq struct {
	Content          string `json:"content" binding:"required"`
	MomentID         uint   `json:"moment_id" binding:"required"`
	ParentID         *uint  `json:"parent_id"`
	ReplyToCommentID *uint  `json:"reply_to_comment_id"`
	ReplyToGuestName string `json:"reply_to_guest_name"`
}

type LikeMomentCommentReq struct {
	CommentID uint `json:"comment_id" binding:"required"`
}

type DeleteMomentCommentReq struct {
	CommentID uint   `json:"comment_id" binding:"required"`
	GuestName string `json:"guest_name"`
}

type MomentCommentController struct{}

func (m MomentCommentController) Create(c *gin.Context) {
	var req CreateMomentCommentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	guestName := generateRandomGuestName()

	guestAvatar := fmt.Sprintf(
		"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%%20cartoon%%20animal%%20avatar%%20%s&image_size=square",
		guestName,
	)

	comment := model.MomentComment{
		Content:          req.Content,
		MomentID:         req.MomentID,
		GuestName:        guestName,
		GuestAvatar:      guestAvatar,
		ParentID:         req.ParentID,
		ReplyToCommentID: req.ReplyToCommentID,
		ReplyToGuestName: req.ReplyToGuestName,
		Likes:            0,
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		logger.Logger.Error("create moment comment error",
			zap.String("guest_name", guestName),
			zap.Uint("moment_id", req.MomentID),
			zap.String("content", req.Content),
			zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "评论创建失败")
		return
	}

	response.Success(c, gin.H{
		"comment":      comment,
		"guest_name":   guestName,
		"guest_avatar": guestAvatar,
	})
}

func (m MomentCommentController) List(c *gin.Context) {
	momentIdStr := c.Query("moment_id")
	if momentIdStr == "" {
		response.Fail(c, http.StatusBadRequest, -1, "缺少moment_id参数")
		return
	}

	momentId, err := strconv.ParseUint(momentIdStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "moment_id格式错误")
		return
	}

	var comments []model.MomentComment
	if err := database.DB.Where("moment_id = ?", momentId).Order("created_at ASC").Find(&comments).Error; err != nil {
		logger.Logger.Error("get moment comments failed", zap.Uint64("moment_id", momentId), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "获取评论列表失败")
		return
	}

	type CommentWithReplies struct {
		model.MomentComment
		Replies []model.MomentComment `json:"replies,omitempty"`
	}

	commentMap := make(map[uint]CommentWithReplies)
	rootComments := make([]CommentWithReplies, 0)

	for _, comment := range comments {
		commentWithReplies := CommentWithReplies{
			MomentComment: comment,
			Replies:       make([]model.MomentComment, 0),
		}
		commentMap[comment.ID] = commentWithReplies
	}

	for _, comment := range comments {
		if comment.ParentID == nil {
			rootComments = append(rootComments, commentMap[comment.ID])
		} else {
			if parent, exists := commentMap[*comment.ParentID]; exists {
				parent.Replies = append(parent.Replies, comment)
				commentMap[*comment.ParentID] = parent
			}
		}
	}

	for i, root := range rootComments {
		rootComments[i] = commentMap[root.ID]
	}

	response.Success(c, rootComments)
}

func (m MomentCommentController) Like(c *gin.Context) {
	var req LikeMomentCommentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, -1, err.Error())
		return
	}

	var comment model.MomentComment
	if err := database.DB.First(&comment, req.CommentID).Error; err != nil {
		logger.Logger.Error("moment comment not found", zap.Uint("comment_id", req.CommentID), zap.Error(err))
		response.Fail(c, http.StatusNotFound, -1, "评论不存在")
		return
	}

	if err := database.DB.Model(&model.MomentComment{}).Where("id = ?", req.CommentID).Update("likes", comment.Likes+1).Error; err != nil {
		logger.Logger.Error("like moment comment failed", zap.Uint("comment_id", req.CommentID), zap.Error(err))
		response.Fail(c, http.StatusInternalServerError, -1, "点赞失败")
		return
	}

	response.Success(c, gin.H{"likes": comment.Likes + 1})
}
