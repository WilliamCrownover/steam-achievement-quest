export interface SteamAchievementSchema extends Record<string, any> {
	name: string;
	defaultvalue?: number;
	displayName?: string;
	description?: string;
	icon?: string;
	pullDate: Date;
}