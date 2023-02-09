import { setColorFill } from '../utils/utils'
import { AchievementGraph } from './AchievementGraph';
import { AchievementPercentages } from './AchievementPercentages';
import { GameTitleInfo } from './GameTitleInfo';

export const GameWithAchievements = (props) => {
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
	} = game;

	return (
		<div className='gameWithAchievementsContainer'>
			<GameTitleInfo game={game} />
			<a className='achievementLink' href={achievementsUrl} target='_blank' rel='noreferrer'>
				<h3>{totalAchievements} Total Achievements</h3>
				{!privateProfile && <h3>{totalCompletedAchievements} Completed - {percentComplete}%</h3>}
			</a>
			{showGraph &&
				<>
					<AchievementGraph game={game} />
					<h3
						className={`${percentComplete === '100.00' && 'achieved'} averagePercent`}
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