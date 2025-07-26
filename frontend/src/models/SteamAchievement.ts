export interface SteamAchievement extends Record<string, any> {
	name: string;
	percent: string;
}

export interface SteamAchievementConverted extends Record<string, any> {
	name: string;
	percent: number;
}