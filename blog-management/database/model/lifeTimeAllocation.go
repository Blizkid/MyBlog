package model

import "gorm.io/gorm"

type LifeTimeAllocation struct {
	gorm.Model
	Category     string  `gorm:"not null" json:"category"`
	Year         int     `gorm:"default:0" json:"year"`
	Month        int     `gorm:"default:0" json:"month"`
	HoursPerDay  float64 `gorm:"not null" json:"hours_per_day"`
	HoursPerWeek float64 `gorm:"not null" json:"hours_per_week"`
	Percentage   float64 `gorm:"not null" json:"percentage"`
	Color        string  `gorm:"not null" json:"color"`
	UserID       uint    `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
