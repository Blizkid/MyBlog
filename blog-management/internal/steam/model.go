package steam

type SteamUserInfo struct {
	SteamID      string `json:"steam_id"`
	PersonaName  string `json:"persona_name"`
	Avatar       string `json:"avatar"`
	AvatarMedium string `json:"avatar_medium"`
	AvatarFull   string `json:"avatar_full"`
	PersonaState int    `json:"persona_state"`
	LastLogOff   int64  `json:"last_logoff"`
}

type SteamGame struct {
	AppID                int    `json:"appid"`
	Name                 string `json:"name"`
	PlaytimeForever      int    `json:"playtime_forever"`
	Playtime2Weeks       int    `json:"playtime_2weeks"`
	PlaytimeWindowsForever int  `json:"playtime_windows_forever"`
	PlaytimeMacForever   int    `json:"playtime_mac_forever"`
	PlaytimeLinuxForever int    `json:"playtime_linux_forever"`
	RtimeLastPlayed      int    `json:"rtime_last_played"`
}

type SteamSummary struct {
	UserInfo      *SteamUserInfo `json:"user_info"`
	TotalGames    int            `json:"total_games"`
	TotalPlaytime int            `json:"total_playtime"`
	FavoriteGames []SteamGame    `json:"favorite_games"`
	HasRealData   bool           `json:"has_real_data"`
}

type steamPlayerSummariesResponse struct {
	Response struct {
		Players []struct {
			SteamID           string `json:"steamid"`
			CommunityVisibilityState int `json:"communityvisibilitystate"`
			ProfileState      int    `json:"profilestate"`
			PersonaName       string `json:"personaname"`
			CommentPermission int    `json:"commentpermission"`
			ProfileURL        string `json:"profileurl"`
			Avatar            string `json:"avatar"`
			AvatarMedium      string `json:"avatarmedium"`
			AvatarFull        string `json:"avatarfull"`
			AvatarHash        string `json:"avatarhash"`
			LastLogOff        int64  `json:"lastlogoff"`
			PersonaState      int    `json:"personastate"`
			PrimaryClanID     string `json:"primaryclanid"`
			TimeCreated       int64  `json:"timecreated"`
			PersonaStateFlags int    `json:"personastateflags"`
			LocCountryCode    string `json:"loccountrycode"`
		} `json:"players"`
	} `json:"response"`
}

type steamOwnedGamesResponse struct {
	Response struct {
		GameCount int `json:"game_count"`
		Games     []struct {
			AppID                int    `json:"appid"`
			Name                 string `json:"name"`
			PlaytimeForever      int    `json:"playtime_forever"`
			Playtime2Weeks       int    `json:"playtime_2weeks,omitempty"`
			PlaytimeWindowsForever int  `json:"playtime_windows_forever"`
			PlaytimeMacForever   int    `json:"playtime_mac_forever"`
			PlaytimeLinuxForever int    `json:"playtime_linux_forever"`
			RtimeLastPlayed      int    `json:"rtime_last_played"`
			HasCommunityVisibleStats int `json:"has_community_visible_stats,omitempty"`
			ImgIconURL           string `json:"img_icon_url"`
			ImgLogoURL           string `json:"img_logo_url,omitempty"`
			HasLeaderboards      int    `json:"has_leaderboards,omitempty"`
		} `json:"games"`
	} `json:"response"`
}
