package steam

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"blog-management/logger"

	"go.uber.org/zap"
)

const (
	SteamAPIEndpoint    = "https://api.steampowered.com"
	DefaultTimeout      = 10 * time.Second
)

type SteamClient struct {
	apiKey     string
	httpClient *http.Client
}

func NewSteamClient(apiKey string) *SteamClient {
	return &SteamClient{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: DefaultTimeout,
		},
	}
}

func (c *SteamClient) GetPlayerSummaries(steamID string) (*SteamUserInfo, error) {
	if c.apiKey == "" || steamID == "" {
		return nil, fmt.Errorf("steam api key or steam id is empty")
	}

	url := fmt.Sprintf("%s/ISteamUser/GetPlayerSummaries/v2/?key=%s&steamids=%s",
		SteamAPIEndpoint, c.apiKey, steamID)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		logger.Logger.Error("Failed to call GetPlayerSummaries", zap.String("steamID", steamID), zap.Error(err))
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Logger.Error("GetPlayerSummaries returned non-200 status",
			zap.Int("status", resp.StatusCode),
			zap.String("body", string(body)))
		return nil, fmt.Errorf("steam api returned status %d", resp.StatusCode)
	}

	var result steamPlayerSummariesResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		logger.Logger.Error("Failed to decode GetPlayerSummaries response", zap.Error(err))
		return nil, err
	}

	if len(result.Response.Players) == 0 {
		return nil, fmt.Errorf("no player found for steam id %s", steamID)
	}

	player := result.Response.Players[0]
	return &SteamUserInfo{
		SteamID:      player.SteamID,
		PersonaName:  player.PersonaName,
		Avatar:       player.Avatar,
		AvatarMedium: player.AvatarMedium,
		AvatarFull:   player.AvatarFull,
		PersonaState: player.PersonaState,
		LastLogOff:   player.LastLogOff,
	}, nil
}

func (c *SteamClient) GetOwnedGames(steamID string) ([]SteamGame, int, error) {
	if c.apiKey == "" || steamID == "" {
		return nil, 0, fmt.Errorf("steam api key or steam id is empty")
	}

	url := fmt.Sprintf("%s/IPlayerService/GetOwnedGames/v1/?key=%s&steamid=%s&include_appinfo=1&include_played_free_games=1",
		SteamAPIEndpoint, c.apiKey, steamID)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		logger.Logger.Error("Failed to call GetOwnedGames", zap.String("steamID", steamID), zap.Error(err))
		return nil, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Logger.Error("GetOwnedGames returned non-200 status",
			zap.Int("status", resp.StatusCode),
			zap.String("body", string(body)))
		return nil, 0, fmt.Errorf("steam api returned status %d", resp.StatusCode)
	}

	var result steamOwnedGamesResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		logger.Logger.Error("Failed to decode GetOwnedGames response", zap.Error(err))
		return nil, 0, err
	}

	games := make([]SteamGame, 0, len(result.Response.Games))
	for _, g := range result.Response.Games {
		games = append(games, SteamGame{
			AppID:                g.AppID,
			Name:                 g.Name,
			PlaytimeForever:      g.PlaytimeForever,
			Playtime2Weeks:       g.Playtime2Weeks,
			PlaytimeWindowsForever: g.PlaytimeWindowsForever,
			PlaytimeMacForever:   g.PlaytimeMacForever,
			PlaytimeLinuxForever: g.PlaytimeLinuxForever,
			RtimeLastPlayed:      g.RtimeLastPlayed,
		})
	}

	return games, result.Response.GameCount, nil
}

func (c *SteamClient) GetSteamSummary(steamID string) (*SteamSummary, error) {
	if c.apiKey == "" || steamID == "" {
		return nil, fmt.Errorf("steam api key or steam id is empty")
	}

	userInfo, err := c.GetPlayerSummaries(steamID)
	if err != nil {
		return nil, fmt.Errorf("failed to get player summaries: %w", err)
	}

	games, totalGames, err := c.GetOwnedGames(steamID)
	if err != nil {
		logger.Logger.Warn("Failed to get owned games, but got user info", zap.Error(err))
		return &SteamSummary{
			UserInfo:    userInfo,
			TotalGames:  0,
			TotalPlaytime: 0,
			FavoriteGames: []SteamGame{},
			HasRealData: true,
		}, nil
	}

	var totalPlaytimeMinutes int
	for _, game := range games {
		totalPlaytimeMinutes += game.PlaytimeForever
	}

	playtimeGames := make([]SteamGame, len(games))
	copy(playtimeGames, games)

	for i := 0; i < len(playtimeGames)-1; i++ {
		for j := i + 1; j < len(playtimeGames); j++ {
			if playtimeGames[i].PlaytimeForever < playtimeGames[j].PlaytimeForever {
				playtimeGames[i], playtimeGames[j] = playtimeGames[j], playtimeGames[i]
			}
		}
	}

	topCount := 10
	if len(playtimeGames) < topCount {
		topCount = len(playtimeGames)
	}
	favoriteGames := playtimeGames[:topCount]

	return &SteamSummary{
		UserInfo:      userInfo,
		TotalGames:    totalGames,
		TotalPlaytime: totalPlaytimeMinutes / 60,
		FavoriteGames: favoriteGames,
		HasRealData:   true,
	}, nil
}
