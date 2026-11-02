package model

import "gorm.io/gorm"

type MomentComment struct {
	gorm.Model
	Content          string        `gorm:"type:text;not null" json:"content"`
	MomentID         uint          `gorm:"not null;index:idx_moment_comments_moment_id" json:"moment_id"`
	GuestName        string        `gorm:"type:varchar(50);not null" json:"guest_name"`
	GuestAvatar      string        `gorm:"type:varchar(255)" json:"guest_avatar"`
	ParentID         *uint         `gorm:"index:idx_moment_comments_parent_id" json:"parent_id"`
	ReplyToCommentID *uint         `gorm:"index:idx_moment_comments_reply_to_comment_id" json:"reply_to_comment_id"`
	ReplyToGuestName string        `gorm:"type:varchar(50)" json:"reply_to_guest_name"`
	Likes            int           `gorm:"default:0" json:"likes"`
	
	Moment           Moment        `gorm:"foreignKey:MomentID;references:ID" json:"-"`
	Parent           *MomentComment `gorm:"foreignKey:ParentID;references:ID" json:"-"`
}
