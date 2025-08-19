import { CombinedAchievementsWithSchema } from "./CombinedAchievements"
import { SteamOwnedGame } from "./SteamOwnedGame"
import { SteamSpyAppDetailsConverted } from "./SteamSpyAppDetails"

export interface GameDataExpanded extends Record<string, any>, SteamOwnedGame {
	achievements: CombinedAchievementsWithSchema[]
	percentComplete: number
	cost: string
	pricePaid: string
	timeToBeat: string
	purchaseDate: string
	focused: boolean
	pricePerHour: number
	costPerTimeToBeat: number
	discountPercent: number
	review: ReviewEnum
	ssAppDetails: SteamSpyAppDetailsConverted | undefined
}

export enum ReviewEnum {
	thumbsUp = 'Thumbs Up',
	thumbsDown = 'Thumbs Down',
	noReview = 'No Review'
}