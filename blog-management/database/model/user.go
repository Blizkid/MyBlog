package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username      string `gorm:"unique;not null"`
	Password      string `gorm:"not null"`
	Email         string `gorm:"unique;not null;type:varchar(100)" validate:"required,email"`
	ChineseName   string `gorm:"type:varchar(50)"`
	EnglishName   string `gorm:"type:varchar(100)"`
	Avatar        string `gorm:"type:varchar(255)"`
	GitHubUrl     string `gorm:"type:varchar(255)"`
	InstagramUrl  string `gorm:"type:varchar(255)"`
	TwitterUrl    string `gorm:"type:varchar(255)"`
	LinkedInUrl   string `gorm:"type:varchar(255)"`
	Bio           string `gorm:"type:text"`
	SteamAPIKey   string `gorm:"type:varchar(255)" json:"-"`
	SteamID       string `gorm:"type:varchar(50)"`
}
