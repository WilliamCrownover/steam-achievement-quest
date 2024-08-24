import { GameDataExpanded } from ".";
import { SteamUserInfo } from "./SteamUserInfo";

export interface PassDownSteamData {
	userData: SteamUserInfo
	gamesWithAchievements: GameDataExpanded[]
	setGamesWithAchievements: React.Dispatch<React.SetStateAction<GameDataExpanded[]>>
	gamesWithoutAchievements: GameDataExpanded[]
	setGamesWithoutAchievements: React.Dispatch<React.SetStateAction<GameDataExpanded[]>>
}