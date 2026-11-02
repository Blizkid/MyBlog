package utils

import (
	config "blog-management/config"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

type CustomClaims struct {
	UserID               uint   `json:"user_id"`
	Username             string `json:"username"`
	jwt.RegisteredClaims        // 内嵌标准声明
}

func GenToken(userID uint, userName string) (string, error) {
	var tokenExpiration time.Duration = 8
	if config.Cfg.App.TokenExpiration > 0 {
		tokenExpiration = time.Duration(config.Cfg.App.TokenExpiration)
	}
	claims := CustomClaims{
		userID,
		userName,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * tokenExpiration)),
			Issuer:    "BlogManagement",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	if config.Cfg.App.JWTSecret == "" {
		return "", errors.New("JWT 签名密钥未配置")
	}
	return token.SignedString([]byte(config.Cfg.App.JWTSecret))
}

func ParseToken(tokenString string) (*CustomClaims, error) {
	if config.Cfg.App.JWTSecret == "" {
		return nil, errors.New("JWT 签名密钥未配置")
	}
	var mc = new(CustomClaims)
	token, err := jwt.ParseWithClaims(tokenString, mc, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.Cfg.App.JWTSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil {
		return nil, err
	}

	if token.Valid {
		return mc, nil
	}
	return nil, errors.New("invalid token")
}
