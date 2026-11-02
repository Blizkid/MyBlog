package main

import (
	"go.uber.org/zap"
	"testing"
	"time"
)

func TestLogZap(t *testing.T) {
	logger, _ := zap.NewProduction() // 创建一个新的 Logger 实例
	defer logger.Sync()              // 确保缓冲区中的日志条目被刷新
	logger.Info("FunTester,例子",      // 使用 logger 记录日志
		zap.String("name", "FunTester"), // 结构化上下文
		zap.Int("score", 100),           // 结构化上下文
	)
	logger.Info("warn FunTester coming!!!")   // 使用 logger 记录警告日志
	logger.Warn("warn FunTester coming!!!")   // 使用 logger 记录警告日志
	logger.Error("error FunTester coming!!!") // 使用 logger 记录错误日志

	sugar := logger.Sugar() // 使用 Sugar 方法创建一个新的 Logger 实例
	sugar.Infow("调用失败",     // 使用 Sugar 方法记录日志
		"方法", "FunTester",
		"调用次数", 3,
		"时间单位", time.Second,
	)
	sugar.Infof("调用方法失败 %s", "FunTester") // 使用 Sugar 方法记录日志
}
