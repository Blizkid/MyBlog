package model

import "gorm.io/gorm"

type Movie struct {
	gorm.Model
	Title       string  `gorm:"not null" json:"title"`
	Genre       string  `gorm:"not null" json:"genre"`
	Rating      float64 `gorm:"not null" json:"rating"`
	Poster      string  `gorm:"not null" json:"poster"`
	Description string  `gorm:"not null" json:"description"`
	UserID      uint    `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
