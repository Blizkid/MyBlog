package model

import "gorm.io/gorm"

type VisitedCity struct {
	gorm.Model
	Name            string  `gorm:"type:varchar(100);not null" json:"name"`
	Lat             float64 `gorm:"type:decimal(10,7);not null" json:"lat"`
	Lng             float64 `gorm:"type:decimal(10,7);not null" json:"lng"`
	Visited         bool    `gorm:"default:true" json:"visited"`
	Year            int     `gorm:"not null" json:"year"`
	IsInternational bool    `gorm:"default:false" json:"is_international"`
	UserID          uint    `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
