package model

import (
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Title     string         `gorm:"not null" json:"title"`
	Excerpt   string         `gorm:"type:text" json:"excerpt"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	Tags      string         `gorm:"type:varchar(255)" json:"tags"`
	Category  string         `gorm:"type:varchar(50)" json:"category"`
	Featured  bool           `gorm:"default:false" json:"featured"`
	Views     uint           `gorm:"default:0" json:"views"`
	UserID    uint           `json:"userId"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
