package model

import "gorm.io/gorm"

type WordCloudTag struct {
	gorm.Model
	Text     string `gorm:"not null" json:"text"`
	Category string `gorm:"not null" json:"category"`
	Weight   int    `gorm:"not null" json:"weight"`
	Color    string `gorm:"not null" json:"color"`
	UserID   uint   `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
