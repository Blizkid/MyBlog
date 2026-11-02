package model

import "gorm.io/gorm"

type Music struct {
	gorm.Model
	Title    string `gorm:"not null" json:"title"`
	Artist   string `gorm:"not null" json:"artist"`
	Genre    string `gorm:"not null" json:"genre"`
	Cover    string `gorm:"not null" json:"cover"`
	Audio    string `gorm:"default:''" json:"audio"`
	Favorite bool   `gorm:"not null;default:false" json:"favorite"`
	UserID   uint   `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
