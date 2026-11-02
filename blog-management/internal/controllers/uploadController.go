package controllers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"blog-management/internal/response"

	"github.com/gin-gonic/gin"
)

const (
	MaxUploadSize     = 10 << 20 // 10MB
	MaxAudioUploadSize = 50 << 20 // 50MB
	UploadDir         = "./uploads"
)

var allowedImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

var allowedAudioExtensions = map[string]bool{
	".mp3":  true,
	".wav":  true,
	".ogg":  true,
	".m4a":  true,
	".flac": true,
}

type UploadController struct{}

func (u UploadController) UploadImage(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxUploadSize)

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "No file received: "+err.Error())
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExtensions[ext] {
		response.Fail(c, http.StatusBadRequest, -1, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
		return
	}

	timestamp := time.Now().UnixNano()
	newFilename := fmt.Sprintf("%d%s", timestamp, ext)
	filePath := filepath.Join(UploadDir, newFilename)

	if err := c.SaveUploadedFile(header, filePath); err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to save file: "+err.Error())
		return
	}

	imageUrl := fmt.Sprintf("/uploads/%s", newFilename)

	response.Success(c, gin.H{
		"url":  imageUrl,
		"name": newFilename,
		"size": header.Size,
	})
}

func (u UploadController) UploadAudio(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxAudioUploadSize)

	file, header, err := c.Request.FormFile("audio")
	if err != nil {
		response.Fail(c, http.StatusBadRequest, -1, "No file received: "+err.Error())
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedAudioExtensions[ext] {
		response.Fail(c, http.StatusBadRequest, -1, "Invalid file type. Allowed: mp3, wav, ogg, m4a, flac")
		return
	}

	timestamp := time.Now().UnixNano()
	newFilename := fmt.Sprintf("%d%s", timestamp, ext)
	filePath := filepath.Join(UploadDir, newFilename)

	if err := c.SaveUploadedFile(header, filePath); err != nil {
		response.Fail(c, http.StatusInternalServerError, -1, "Failed to save file: "+err.Error())
		return
	}

	audioUrl := fmt.Sprintf("/uploads/%s", newFilename)

	response.Success(c, gin.H{
		"url":  audioUrl,
		"name": newFilename,
		"size": header.Size,
	})
}
