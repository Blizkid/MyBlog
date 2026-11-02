package model

import (
	"time"

	"gorm.io/gorm"
)

type SavedBlog struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Title       string         `gorm:"not null" json:"title"`
	Excerpt     string         `gorm:"type:text" json:"excerpt"`
	Author      string         `gorm:"type:varchar(100)" json:"author"`
	Source      string         `gorm:"type:varchar(100)" json:"source"`
	Tags        string         `gorm:"type:varchar(255)" json:"tags"`
	Category    string         `gorm:"type:varchar(50)" json:"category"`
	URL         string         `gorm:"type:varchar(500)" json:"url"`
	PublishedAt string         `gorm:"type:varchar(20)" json:"publishedAt"`
	UserID      uint           `json:"userId"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
