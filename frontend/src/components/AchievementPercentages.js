import { round, setColorFill } from '../utils/utils'

export const AchievementPercentages = ({ achievements }) => {

	return (
		<div className='achievementList'>
			{achievements.map((achievement) => {
				const percent = round(achievement.percent);
				const colorFill = setColorFill(percent);
				const achieved = achievement.achieved && 'achieved'
				return <h3 key={achievement.name} title={achievement.hoverInfo} style={{ backgroundColor: colorFill }} className={achieved}>{percent}</h3>
			})}
		</div>
	)
}
