export interface SteamOwnedGame {
	appid: number;
	name: string;
	playtime_forever: number;
	img_icon_url: string;
	has_community_visible_stats: boolean;
	playtime_windows_forever: number;
	playtime_mac_forever: number;
	playtime_linux_forever: number;
	playtime_deck_forever: number;
	rtime_last_played: number;
	has_workshop: boolean;
	has_market: boolean;
	has_dlc: boolean;
	playtime_disconnected: number;
}