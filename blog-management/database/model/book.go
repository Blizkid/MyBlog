package model

import "gorm.io/gorm"

type Book struct {
	gorm.Model
	Title   string  `gorm:"not null" json:"title"`
	Author  string  `gorm:"not null" json:"author"`
	Genre   string  `gorm:"not null" json:"genre"`
	Cover   string  `gorm:"not null" json:"cover"`
	Rating  float64 `gorm:"not null" json:"rating"`
	Status  string  `gorm:"not null" json:"status"`
	UserID  uint    `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
