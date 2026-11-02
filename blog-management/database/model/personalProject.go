package model

import (
	"time"

	"gorm.io/gorm"
)

type PersonalProject struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"not null;type:varchar(100)" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	TechStack   string         `gorm:"type:varchar(500)" json:"techStack"`
	Github      string         `gorm:"type:varchar(500)" json:"github"`
	Demo        string         `gorm:"type:varchar(500)" json:"demo"`
	Status      string         `gorm:"type:varchar(20);default:'开发中'" json:"status"`
	Stars       uint           `gorm:"default:0" json:"stars"`
	Commits     uint           `gorm:"default:0" json:"commits"`
	Tags        string         `gorm:"type:varchar(500)" json:"tags"`
	UserID      uint           `json:"userId"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
