package main

import (
	config "blog-management/config"
	"blog-management/database"
	"blog-management/database/seed"
	"blog-management/logger"
	"blog-management/routers"
	"fmt"

	"go.uber.org/zap"
)

func main() {
	//1. 读取配置文件
	err := config.InitConfig()
	if err != nil {
		fmt.Printf("config.InitConfig failed. %s \n", err.Error())
		return
	}

	// 2. 初始化日志文件
	logger.InitLogger(config.Cfg.LogConfig)
	// 3. 初始化数据库
	database.InitDb()

	// 4. 初始化管理员账户
	if err := seed.InitAdmin(); err != nil {
		logger.Logger.Error("failed to init admin user", zap.String("error", err.Error()))
	}

	// 5. 初始化gin网络框架，初始化路由
	r := routers.InitRouter()
	port := fmt.Sprintf(":%d", config.Cfg.App.Port)
	err = r.Run(port)
	if err != nil {
		logger.Logger.Error("failed start server", zap.String("error", err.Error()))
		return
	}
}
