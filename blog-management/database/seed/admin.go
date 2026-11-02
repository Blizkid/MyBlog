package seed

import (
	"blog-management/database"
	"blog-management/database/model"
	"blog-management/logger"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

const (
	AdminEmail    = "admin@example.com"
	AdminUsername = "admin"
	AdminPassword = "123456"
)

func InitAdmin() error {
	var existingUser model.User
	result := database.DB.Where("email = ? OR username = ?", AdminEmail, AdminUsername).First(&existingUser)

	if result.Error == nil {
		logger.Logger.Info("Admin user already exists, skipping creation",
			zap.String("email", AdminEmail),
			zap.String("username", AdminUsername))
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		logger.Logger.Error("Failed to hash admin password", zap.Error(err))
		return err
	}

	adminUser := model.User{
		Username:     AdminUsername,
		Email:        AdminEmail,
		Password:     string(hashedPassword),
		ChineseName:  "数字游牧人",
		EnglishName:  "Digital Nomad",
		Avatar:       "",
		GitHubUrl:    "https://github.com",
		InstagramUrl: "https://instagram.com",
		TwitterUrl:   "https://twitter.com",
		LinkedInUrl:  "https://linkedin.com",
		Bio:          "热爱编程与旅行的数字游牧者",
	}

	if err := database.DB.Create(&adminUser).Error; err != nil {
		logger.Logger.Error("Failed to create admin user", zap.Error(err))
		return err
	}

	logger.Logger.Info("Admin user created successfully",
		zap.String("email", AdminEmail),
		zap.String("username", AdminUsername))

	return nil
}
