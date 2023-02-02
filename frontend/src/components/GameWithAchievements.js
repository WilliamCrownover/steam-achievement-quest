import { setColorFill } from '../utils/utils'
import { AchievementGraph } from './AchievementGraph';
import { AchievementPercentages } from './AchievementPercentages';
import { GameTitleInfo } from './GameTitleInfo';

export const GameWithAchievements = ({ game }) => {
	const {
		achievements,
		averagePercent,
		percentComplete,
		achievementsUrl,
		totalAchievements,
		totalCompletedAchievements,
	} = game;

	const lineArray = [
		{class:'ninetyPercent'},
		{class:'fiftyPercent'},
		{class:'tenPercent'},
	]

	return (
		<div className='gameAchievementsContainer'>
			<AchievementGraph achievements={achievements} />
			{lineArray.map((line) => 
				<div key={line.class} className={`horizontalGraphLine ${line.class}`}/>
			)}
			<div 
				className='horizontalGraphLine averagePercentLine'
				style={{ top: `${(100 - averagePercent) * 3}px` }}
			/>
			<h3
				className={`${percentComplete === '100.00' && 'achieved'} averagePercent`}
				style={{ backgroundColor: setColorFill(averagePercent) }}
			>
				{averagePercent}
			</h3>
			<AchievementPercentages achievements={achievements} />
			<GameTitleInfo game={game} />
			<a className='achievementLink' href={achievementsUrl} target='_blank' rel='noreferrer'>{totalAchievements} Total Achievements</a>
			<h3 className='bottomItem'>{totalCompletedAchievements} Completed - {percentComplete}%</h3>
		</div>
	)
}