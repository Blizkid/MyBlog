package utils

import (
	"blog-management/config"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWTConfiguredSecret(t *testing.T) {
	previous := config.Cfg.App
	t.Cleanup(func() { config.Cfg.App = previous })
	config.Cfg.App.JWTSecret = "test-only-random-signing-key-for-jwt-regression"
	config.Cfg.App.TokenExpiration = 1

	token, err := GenToken(42, "测试用户")
	if err != nil {
		t.Fatal(err)
	}
	claims, err := ParseToken(token)
	if err != nil || claims == nil {
		t.Fatalf("有效令牌验证失败: %v", err)
	}
	if claims.UserID != 42 || claims.Username != "测试用户" {
		t.Fatalf("用户信息未正确保留: %+v", claims)
	}

	config.Cfg.App.JWTSecret = "another-test-only-signing-key-after-rotation"
	if _, err := ParseToken(token); err == nil {
		t.Fatal("密钥轮换后旧令牌应失效")
	}

	config.Cfg.App.JWTSecret = ""
	if _, err := GenToken(42, "测试用户"); err == nil {
		t.Fatal("未配置密钥时不应签发令牌")
	}
	if _, err := ParseToken(token); err == nil {
		t.Fatal("未配置密钥时不应接受令牌")
	}
}

func TestJWTRejectsUnexpectedAlgorithmAndExpiredToken(t *testing.T) {
	previous := config.Cfg.App
	t.Cleanup(func() { config.Cfg.App = previous })
	config.Cfg.App.JWTSecret = "test-only-random-signing-key-for-jwt-regression"

	tests := []struct {
		name   string
		method jwt.SigningMethod
		expiry time.Time
	}{
		{"拒绝非HS256算法", jwt.SigningMethodHS384, time.Now().Add(time.Hour)},
		{"拒绝过期令牌", jwt.SigningMethodHS256, time.Now().Add(-time.Minute)},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			claims := CustomClaims{
				UserID: 42,
				RegisteredClaims: jwt.RegisteredClaims{
					ExpiresAt: jwt.NewNumericDate(tc.expiry),
				},
			}
			token, err := jwt.NewWithClaims(tc.method, claims).SignedString([]byte(config.Cfg.App.JWTSecret))
			if err != nil {
				t.Fatal(err)
			}
			if _, err := ParseToken(token); err == nil {
				t.Fatal("不应接受该令牌")
			}
		})
	}
}
