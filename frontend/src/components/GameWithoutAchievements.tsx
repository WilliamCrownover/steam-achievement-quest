import {
	GameDataExpanded,
	ReviewEnum
} from '../models';
import { getEnumKeyByValue } from '../utils/utils';
import { GamePriceInput } from './GamePriceInput';
import { GameTitleInfo } from './GameTitleInfo';
import { SpecificGameDataPoint } from './SpecificGameDataPoint';
import { SteamSpyAppDetails } from './SteamSpyAppDetails';

type GameWithoutAchievementsProps = {
	game: GameDataExpanded
	showSteamSpyAppDetails: boolean
}

export const GameWithoutAchievements = ({ game, showSteamSpyAppDetails }: GameWithoutAchievementsProps) => {
	const {
		pricePerHour,
		costPerTimeToBeat,
		discountPercent,
		review,
		ssAppDetails,
	} = game;

	const goodPricePerHour = pricePerHour !== 0 && pricePerHour <= 0.5;
	const goodCostPerTimeToBeat = costPerTimeToBeat !== 0 && costPerTimeToBeat <= 0.5;
	const goodDiscount = discountPercent >= 75;
	const badPricePerHour = pricePerHour !== 0 && pricePerHour >= 1.5;
	const badCostPerTimeToBeat = costPerTimeToBeat !== 0 && costPerTimeToBeat >= 1.5;
	const badDiscount = discountPercent < 0;

	return (
		<div className={`gameWithoutAchievements ${getEnumKeyByValue(ReviewEnum, review)}`}>
			<GameTitleInfo game={game} />
			<GamePriceInput game={game} />
			<div className='gameSpecificDataPoints'>
				<SpecificGameDataPoint
					title='Price/Hour Played $'
					data={pricePerHour}
					isGoodValue={goodPricePerHour}
					isBadValue={badPricePerHour}
				/>
				<SpecificGameDataPoint
					title='Cost/Hour Time to Beat $'
					data={costPerTimeToBeat}
					isGoodValue={goodCostPerTimeToBeat}
					isBadValue={badCostPerTimeToBeat}
				/>
				<SpecificGameDataPoint
					title='Discount'
					data={discountPercent}
					isGoodValue={goodDiscount}
					isPercent={true}
					isBadValue={badDiscount}
				/>
			</div>
			{(ssAppDetails && showSteamSpyAppDetails) &&
				<SteamSpyAppDetails ssAppDetails={ssAppDetails} />
			}
		</div>
	)
}