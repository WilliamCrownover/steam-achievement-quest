import { CombinedAchievementsWithSchema } from "./CombinedAchievements"
import { SteamOwnedGame } from "./SteamOwnedGame"

export interface GameDataExpanded extends Record<string, any>, SteamOwnedGame {
	achievements: CombinedAchievementsWithSchema[]
	percentComplete: number
	cost: string
	pricePaid: string
	timeToBeat: string
	pricePerHour: number
	costPerTimeToBeat: number
	discountPercent: number
	review: ReviewEnum
}

export enum ReviewEnum {
	thumbsUp = 'Thumbs Up',
	thumbsDown = 'Thumbs Down',
	noReview = 'No Review'
}