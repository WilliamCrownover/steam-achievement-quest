import { setColorFill } from '../utils/utils'
import { AchievementGraph } from './AchievementGraph';
import { AchievementPercentages } from './AchievementPercentages';
import { GameTitleInfo } from './GameTitleInfo';

export const GameWithAchievements = ({ game, privateProfile }) => {
	const {
		achievements,
		averagePercent,
		percentComplete,
		achievementsUrl,
		totalAchievements,
		totalCompletedAchievements,
	} = game;

	return (
		<>
			<GameTitleInfo game={game} />
			<a className='achievementLink' href={achievementsUrl} target='_blank' rel='noreferrer'>{totalAchievements} Total Achievements</a>
			{!privateProfile && <h3>{totalCompletedAchievements} Completed - {percentComplete}%</h3>}
			<AchievementGraph game={game}/>
			<h3
				className={`${percentComplete === '100.00' && 'achieved'} averagePercent`}
				style={{ backgroundColor: setColorFill(averagePercent) }}
			>
				{averagePercent}
			</h3>
			<AchievementPercentages achievements={achievements} />
			<div className='bottomItem' />
		</>
	)
}