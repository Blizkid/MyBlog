package config

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"os"
)

var Cfg = new(Config)

type Config struct {
	App       AppConfig      `yaml:"app"`
	Database  DatabaseConfig `yaml:"database"`
	LogConfig LogConfig      `yaml:"log"`
}
type AppConfig struct {
	Name            string `yaml:"name"`
	Mode            string `yaml:"mode"`
	Port            int64  `yaml:"port"`
	TokenExpiration int64  `yaml:"token_expiration"`
	JWTSecret       string `yaml:"jwt_secret"`
}

type DatabaseConfig struct {
	DSN        string `yaml:"dsn"`
	Driver     string `yaml:"driver"`
	Host       string `yaml:"host"`
	Port       int64  `yaml:"port"`
	Username   string `yaml:"username"`
	Password   string `yaml:"password"`
	Datasource string `yaml:"datasource"`
}

type LogConfig struct {
	Level      string `yaml:"level"`
	Mode       string `yaml:"mode"`
	FilePath   string `yaml:"file_path"`
	FileName   string `yaml:"file_name"`
	MaxSize    int    `yaml:"max_size"`
	MaxBackups int    `yaml:"max_backups"`
	MaxAge     int    `yaml:"max_age"`
	Compress   bool   `yaml:"compress"`
}

// InitConfig 默认读取程序根目录下的 config.yaml
func InitConfig() error {
	file, err := os.ReadFile("./config.yaml")
	if err != nil {
		fmt.Println("ReadFile ./config.yaml err:", err)
		return err
	}

	if err = yaml.Unmarshal(file, Cfg); err != nil {
		return err
	}
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		Cfg.App.JWTSecret = secret
	}
	if Cfg.App.JWTSecret == "" {
		return fmt.Errorf("请设置 JWT_SECRET 环境变量或 config.yaml 中的 app.jwt_secret")
	}
	return nil
}
