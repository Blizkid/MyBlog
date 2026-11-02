package controllers

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/internal/response"
	"blog-management/logger"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type PageViewController struct{}

type RecordVisitReq struct {
	Path        string `json:"path"`
	Referer     string `json:"referer"`
	UserAgent   string `json:"userAgent"`
}

func generateVisitorID(ip, userAgent string) string {
	data := fmt.Sprintf("%s|%s|%d", ip, userAgent, time.Now().YearDay())
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])[:16]
}

func getClientIP(c *gin.Context) string {
	ip := c.GetHeader("X-Forwarded-For")
	if ip != "" {
		ips := strings.Split(ip, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	ip = c.GetHeader("X-Real-IP")
	if ip != "" {
		return ip
	}

	ip = c.ClientIP()
	if ip == "::1" || ip == "127.0.0.1" {
		return "localhost"
	}
	return ip
}

func (p PageViewController) RecordVisit(c *gin.Context) {
	var req RecordVisitReq
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Path = c.GetHeader("X-Request-Path")
		if req.Path == "" {
			req.Path = "/"
		}
	}

	if req.UserAgent == "" {
		req.UserAgent = c.GetHeader("User-Agent")
	}
	if req.Referer == "" {
		req.Referer = c.GetHeader("Referer")
	}

	ip := getClientIP(c)
	today := time.Now().Format("2006-01-02")
	visitorID := generateVisitorID(ip, req.UserAgent)

	var existingTodayVisit model.PageView
	err := database.DB.Where("visitor_id = ? AND visit_date = ? AND path = ?", visitorID, today, req.Path).
		First(&existingTodayVisit).Error

	if err != nil {
		pageView := model.PageView{
			VisitorID: visitorID,
			Path:      req.Path,
			UserAgent: req.UserAgent,
			IPAddress: ip,
			Referer:   req.Referer,
			VisitDate: today,
		}

		if err := database.DB.Create(&pageView).Error; err != nil {
			logger.Logger.Error("Failed to record page view", zap.Error(err))
			response.Fail(c, http.StatusInternalServerError, -1, "Failed to record visit")
			return
		}
	}

	response.Success(c, gin.H{
		"visitorId": visitorID,
		"date":      today,
	})
}

func (p PageViewController) GetStats(c *gin.Context) {
	var totalPageViews, totalUniqueVisitors int64
	var todayPageViews, todayUniqueVisitors int64

	today := time.Now().Format("2006-01-02")

	if err := database.DB.Model(&model.PageView{}).Count(&totalPageViews).Error; err != nil {
		logger.Logger.Error("Failed to count total page views", zap.Error(err))
		totalPageViews = 0
	}

	if err := database.DB.Model(&model.PageView{}).Distinct("visitor_id").Count(&totalUniqueVisitors).Error; err != nil {
		logger.Logger.Error("Failed to count total unique visitors", zap.Error(err))
		totalUniqueVisitors = 0
	}

	if err := database.DB.Model(&model.PageView{}).Where("visit_date = ?", today).Count(&todayPageViews).Error; err != nil {
		logger.Logger.Error("Failed to count today page views", zap.Error(err))
		todayPageViews = 0
	}

	if err := database.DB.Model(&model.PageView{}).Where("visit_date = ?", today).Distinct("visitor_id").Count(&todayUniqueVisitors).Error; err != nil {
		logger.Logger.Error("Failed to count today unique visitors", zap.Error(err))
		todayUniqueVisitors = 0
	}

	response.Success(c, gin.H{
		"totalPageViews":        totalPageViews,
		"totalUniqueVisitors":   totalUniqueVisitors,
		"todayPageViews":        todayPageViews,
		"todayUniqueVisitors":   todayUniqueVisitors,
		"today":                 today,
	})
}
