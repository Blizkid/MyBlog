package model

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Content   string         `gorm:"not null" json:"content"`
	PostID    uint           `json:"postId"`
	UserID    uint           `json:"userId"`

	RelatedPostID Post `gorm:"foreignKey:PostID;references:ID" json:"-"`
	AccountId     User `gorm:"foreignKey:UserID;references:ID" json:"-"`
	
	Username string `gorm:"-" json:"username"`
	Avatar   string `gorm:"-" json:"avatar"`
}
