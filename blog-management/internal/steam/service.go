package steam

import (
	"sync"
	"time"

	"blog-management/database"
	"blog-management/database/model"
	"blog-management/logger"

	"go.uber.org/zap"
)

type cacheEntry struct {
	data       *SteamSummary
	expireTime time.Time
}

type SteamService struct {
	cache      sync.Map
	cacheTTL   time.Duration
	mu         sync.Mutex
}

var defaultSteamService *SteamService
var serviceOnce sync.Once

func GetSteamService() *SteamService {
	serviceOnce.Do(func() {
		defaultSteamService = &SteamService{
			cacheTTL: 1 * time.Hour,
		}
	})
	return defaultSteamService
}

func NewSteamService(cacheTTL time.Duration) *SteamService {
	return &SteamService{
		cacheTTL: cacheTTL,
	}
}

func (s *SteamService) getCacheKey(userID uint, steamID string) string {
	return string(rune(userID)) + ":" + steamID
}

func (s *SteamService) getFromCache(key string) (*SteamSummary, bool) {
	entry, ok := s.cache.Load(key)
	if !ok {
		return nil, false
	}

	cacheEntry := entry.(*cacheEntry)
	if time.Now().After(cacheEntry.expireTime) {
		s.cache.Delete(key)
		return nil, false
	}

	return cacheEntry.data, true
}

func (s *SteamService) setToCache(key string, data *SteamSummary) {
	s.cache.Store(key, &cacheEntry{
		data:       data,
		expireTime: time.Now().Add(s.cacheTTL),
	})
}

func (s *SteamService) ClearCache(userID uint, steamID string) {
	key := s.getCacheKey(userID, steamID)
	s.cache.Delete(key)
	logger.Logger.Info("Steam cache cleared", zap.Uint("userID", userID), zap.String("steamID", steamID))
}

func (s *SteamService) GetSteamSummary(userID uint, forceRefresh bool) (*SteamSummary, error) {
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		logger.Logger.Error("Failed to get user for steam service",
			zap.Uint("userID", userID),
			zap.Error(err))
		return nil, err
	}

	if user.SteamAPIKey == "" || user.SteamID == "" {
		logger.Logger.Info("Steam API Key or Steam ID is empty",
			zap.Uint("userID", userID),
			zap.Bool("hasAPIKey", user.SteamAPIKey != ""),
			zap.Bool("hasSteamID", user.SteamID != ""))
		return nil, nil
	}

	cacheKey := s.getCacheKey(userID, user.SteamID)

	if !forceRefresh {
		if cachedData, ok := s.getFromCache(cacheKey); ok {
			logger.Logger.Info("Returning cached steam data",
				zap.Uint("userID", userID),
				zap.String("steamID", user.SteamID))
			return cachedData, nil
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if !forceRefresh {
		if cachedData, ok := s.getFromCache(cacheKey); ok {
			return cachedData, nil
		}
	}

	logger.Logger.Info("Fetching real steam data from API",
		zap.Uint("userID", userID),
		zap.String("steamID", user.SteamID),
		zap.Bool("forceRefresh", forceRefresh))

	client := NewSteamClient(user.SteamAPIKey)

	summary, err := client.GetSteamSummary(user.SteamID)
	if err != nil {
		logger.Logger.Error("Failed to get steam summary from API",
			zap.Uint("userID", userID),
			zap.String("steamID", user.SteamID),
			zap.Error(err))
		return nil, err
	}

	s.setToCache(cacheKey, summary)
	logger.Logger.Info("Steam data fetched and cached successfully",
		zap.Uint("userID", userID),
		zap.String("steamID", user.SteamID),
		zap.Int("totalGames", summary.TotalGames),
		zap.Int("totalPlaytimeHours", summary.TotalPlaytime))

	return summary, nil
}

func (s *SteamService) GetSteamSummaryForPublic() (*SteamSummary, error) {
	var users []model.User
	if err := database.DB.Order("id ASC").Limit(1).Find(&users).Error; err != nil || len(users) == 0 {
		logger.Logger.Error("Failed to get first user for public steam summary", zap.Error(err))
		return nil, err
	}

	user := users[0]
	if user.SteamAPIKey == "" || user.SteamID == "" {
		return nil, nil
	}

	return s.GetSteamSummary(user.ID, false)
}
