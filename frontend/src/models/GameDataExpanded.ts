import { CombinedAchievementsWithSchema } from './CombinedAchievements';
import { SteamOwnedGame } from './SteamOwnedGame';
import { SteamSpyAppDetailsConverted } from './SteamSpyAppDetails';

export interface GameDataExpanded extends Record<string, any>, SteamOwnedGame {
	achievements: CombinedAchievementsWithSchema[] | undefined;
	percentComplete: number;
	cost: string;
	pricePaid: string;
	timeToBeat: string;
	purchaseDate: string;
	focused: boolean;
	isHidden: boolean;
	pricePerHour: number;
	costPerTimeToBeat: number;
	discountPercent: number;
	review: ReviewEnum;
	ssAppDetails: SteamSpyAppDetailsConverted | undefined;
	ownersCount: number;
	total_reviews: number;
	total_positive: number;
	total_negative: number;
}

export enum ReviewEnum {
	thumbsUp = 'Thumbs Up',
	thumbsDown = 'Thumbs Down',
	noReview = 'No Review',
}

export interface ReviewData {
	total_reviews: number;
	total_positive: number;
	total_negative: number;
	pullDate: Date;
}
