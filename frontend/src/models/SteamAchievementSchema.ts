export interface SteamAchievementSchema extends Record<string, any> {
	name: string;
	defaultvalue: number;
	displayName: string;
	hidden: number;
	description: string;
	icon: string;
	icongray: string;
}