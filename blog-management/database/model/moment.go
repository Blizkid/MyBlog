package model

import "gorm.io/gorm"

type Moment struct {
	gorm.Model
	Content  string `gorm:"type:text" json:"content"`
	Images   string `gorm:"type:text" json:"images"`
	Location string `gorm:"type:varchar(100)" json:"location"`
	Likes    int    `gorm:"default:0" json:"likes"`
	Comments int    `gorm:"default:0" json:"comments"`
	UserID   uint   `json:"user_id"`

	AccountId User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
