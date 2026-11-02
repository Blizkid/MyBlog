package model

import (
	"time"

	"gorm.io/gorm"
)

type WorkExperience struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Company     string         `gorm:"not null;type:varchar(100)" json:"company"`
	Role        string         `gorm:"not null;type:varchar(100)" json:"role"`
	Period      string         `gorm:"not null;type:varchar(50)" json:"period"`
	Description string         `gorm:"type:text" json:"description"`
	TechStack   string         `gorm:"type:varchar(500)" json:"techStack"`
	Achievements string        `gorm:"type:text" json:"achievements"`
	UserID      uint           `json:"userId"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
