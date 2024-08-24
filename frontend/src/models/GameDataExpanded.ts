import { CombinedAchievementsWithSchema } from "./CombinedAchievements"
import { SteamOwnedGame } from "./SteamOwnedGame"

export interface GameDataExpanded extends Record<string, any>, SteamOwnedGame {
	achievements: CombinedAchievementsWithSchema[]
	cost: string
	pricePaid: string
	timeToBeat: string
}