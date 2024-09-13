import { getEnumKeyByValue, round, setColorFill } from '../utils/utils'
import { AchievementGraph } from './AchievementGraph';
import { AchievementPercentages } from './AchievementPercentages';
import { GameTitleInfo } from './GameTitleInfo';
import { GamePriceInput } from './GamePriceInput';
import { GameDataExpanded, ReviewEnum } from '../models';
import { SpecificGameDataPoint } from './SpecificGameDataPoint';

type GameWithAchievementsProps = {
	key: number
	game: GameDataExpanded
	privateProfile?: boolean
	showGraph: boolean
	showList: boolean
	showIcons: boolean
}

export const GameWithAchievements = (props: GameWithAchievementsProps) => {
	const {
		game,
		privateProfile,
		showGraph,
		showList,
		showIcons,
	} = props

	const {
		achievements,
		averagePercent,
		percentComplete,
		achievementsUrl,
		totalAchievements,
		totalCompletedAchievements,
		totalIncompleteAchievements,
		pricePerHour,
		costPerTimeToBeat,
		discountPercent,
		review
	} = game;

	const oneHundredPercent = percentComplete === 100.00 ? 'oneHundredPercent' : '';
	const goodPricePerHour = pricePerHour !== 0 && pricePerHour <= 0.5;
	const goodCostPerTimeToBeat = costPerTimeToBeat !== 0 && costPerTimeToBeat <= 0.5;
	const goodDiscount = discountPercent >= 75;
	const badPricePerHour = pricePerHour !== 0 && pricePerHour >= 1.5;
	const badCostPerTimeToBeat = costPerTimeToBeat !== 0 && costPerTimeToBeat >= 1.5;
	const badDiscount = discountPercent < 0;

	return (
		<div className={`gameWithAchievementsContainer ${getEnumKeyByValue(ReviewEnum, review)}`}>
			<GameTitleInfo game={game} />
			<div className='multipleForms'>
				<a 
					className={`achievementLink ${oneHundredPercent}`} 
					href={achievementsUrl} 
					target='_blank' 
					rel='noreferrer'
				>
					<h3>{totalAchievements} Total Achievements</h3>
					{!privateProfile &&
						<>
							<h3>{totalIncompleteAchievements} Not Completed - {round(100 - percentComplete)}%</h3>
							<h3>{totalCompletedAchievements} Completed - {percentComplete}%</h3>
						</>
					}
				</a>
				<GamePriceInput game={game} />
			</div>
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
			{showGraph &&
				<>
					<AchievementGraph game={game} />
					<h3
						className={`${percentComplete === 100.00 && 'achieved'} averagePercent`}
						style={{ backgroundColor: setColorFill(averagePercent) }}
					>
						{averagePercent}
					</h3>
				</>
			}
			{showList && <AchievementPercentages achievements={achievements} showIcons={showIcons} />}
		</div>
	)
}