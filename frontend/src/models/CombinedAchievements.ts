import { SteamAchievementSchema } from "./SteamAchievementSchema";

export interface CombinedAchievements {
	name: string;
	percent: number;
	achieved: boolean;
	unlockDate: string;
	unlockTime: number;
	hoverInfo?: string
}

export interface CombinedAchievementsWithSchema extends CombinedAchievements, SteamAchievementSchema {}