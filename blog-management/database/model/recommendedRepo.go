package model

import (
	"time"

	"gorm.io/gorm"
)

type RecommendedRepo struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"not null;type:varchar(100)" json:"name"`
	Author      string         `gorm:"not null;type:varchar(100)" json:"author"`
	Description string         `gorm:"type:text" json:"description"`
	Github      string         `gorm:"not null;type:varchar(500)" json:"github"`
	Stars       uint           `gorm:"default:0" json:"stars"`
	Language    string         `gorm:"type:varchar(50)" json:"language"`
	Tags        string         `gorm:"type:varchar(500)" json:"tags"`
	UserID      uint           `json:"userId"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
