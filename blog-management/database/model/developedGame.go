package model

import "gorm.io/gorm"

type DevelopedGame struct {
	gorm.Model
	Name      string   `gorm:"not null" json:"name"`
	Status    string   `gorm:"not null" json:"status"`
	Progress  int      `gorm:"not null" json:"progress"`
	TechStack string   `gorm:"not null" json:"tech_stack"`
	Poster    string   `gorm:"not null" json:"poster"`
	UserID    uint     `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
