import { round, setColorFill } from '../utils/utils'

export const AchievementPercentages = ({ achievements }) => {

	return (
		<div className='achievementList'>
			{achievements.map((achievement) => {
				const percent = round(achievement.percent);
				const colorFill = setColorFill(percent);
				const achieved = achievement.achieved && 'achieved'
				return (
					<div key={achievement.name} title={achievement.hoverInfo}>
						<h3 style={{ backgroundColor: colorFill }} className={achieved}>{percent}</h3>
						<img src={achievement.icon} alt={achievement.displayName} height='40' />
					</div>
				)
			})}
		</div>
	)
}
