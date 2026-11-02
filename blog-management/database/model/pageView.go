package model

import "gorm.io/gorm"

type PageView struct {
	gorm.Model
	VisitorID   string `gorm:"type:varchar(64);index;not null"`
	SessionID   string `gorm:"type:varchar(64);index"`
	Path        string `gorm:"type:varchar(255);not null"`
	UserAgent   string `gorm:"type:text"`
	IPAddress   string `gorm:"type:varchar(64);index"`
	Referer     string `gorm:"type:varchar(255)"`
	VisitDate   string `gorm:"type:varchar(10);index;not null"`
}

type VisitStats struct {
	TotalPageViews    int64
	TotalUniqueVisitors int64
	TodayPageViews    int64
	TodayUniqueVisitors int64
}
