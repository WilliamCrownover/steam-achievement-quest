import { setColorFill } from '../utils/utils'
import { AchievementGraph } from './AchievementGraph';
import { AchievementPercentages } from './AchievementPercentages';
import { GameTitleInfo } from './GameTitleInfo';

export const GameWithAchievements = ({ game }) => {
	const distribution = game.achievementDifficultyDistribution;

	return (
		<>
			<AchievementGraph achievements={game.achievements} />
			{distribution?.easyPercent !== undefined &&
				<div className='difficultyBar'>
					<div className='segment easy' style={{ width: `${distribution.easyPercent}%` }} />
					<div className='segment medium' style={{ width: `${distribution.mediumPercent}%` }} />
					<div className='segment hard' style={{ width: `${distribution.hardPercent}%` }} />
					<div className='segment impossible' style={{ width: `${distribution.impossiblePercent}%` }} />
				</div>
			}
			<h3
				className={`${game.percentComplete === '100.00' && 'achieved'}`}
				style={{ backgroundColor: setColorFill(game.averagePercent), margin: '3px 0px' }}
			>
				{game.averagePercent}
			</h3>
			<AchievementPercentages achievements={game.achievements} />
			<GameTitleInfo game={game} />
			<h3>{game.totalAchievements} Total Achievements</h3>
			<h3 className='bottomItem'>{game.totalCompletedAchievements} Completed - {game.percentComplete}%</h3>
		</>
	)
}