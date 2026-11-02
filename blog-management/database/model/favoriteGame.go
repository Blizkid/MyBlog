package model

import "gorm.io/gorm"

type FavoriteGame struct {
	gorm.Model
	Name        string  `gorm:"not null" json:"name"`
	Genre       string  `gorm:"not null" json:"genre"`
	Hours       int     `gorm:"not null" json:"hours"`
	Rating      float64 `gorm:"not null" json:"rating"`
	Poster      string  `gorm:"not null" json:"poster"`
	Description string  `gorm:"not null" json:"description"`
	UserID      uint    `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
