import { setColorFill } from '../utils/utils'
import { AchievementGraph } from './AchievementGraph';
import { AchievementPercentages } from './AchievementPercentages';
import { GameTitleInfo } from './GameTitleInfo';

export const GameWithAchievements = ({ game }) => {

	return (
		<>
			<AchievementGraph achievements={game.achievements} />
			<h3
				className={`${game.percentComplete === '100.00' && 'achieved'} averagePercent`}
				style={{ backgroundColor: setColorFill(game.averagePercent), margin: '3px 0px' }}
			>
				{game.averagePercent}
			</h3>
			<AchievementPercentages achievements={game.achievements} />
			<GameTitleInfo game={game} />
			<a className='achievementLink' href={game.achievementsUrl} target='_blank' rel='noreferrer'>{game.totalAchievements} Total Achievements</a>
			<h3 className='bottomItem'>{game.totalCompletedAchievements} Completed - {game.percentComplete}%</h3>
		</>
	)
}