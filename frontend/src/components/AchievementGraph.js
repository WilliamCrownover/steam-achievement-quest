import { round, setColorFill } from '../utils/utils'

export const AchievementGraph = ({ achievements }) => {

	return (
		<div className='achievementGraph'>
			{achievements.map((achievement) => {
				const percent = round(achievement.percent);
				const colorFill = setColorFill(percent);
				const colorFillAchieved = setColorFill(percent, achievement.achieved);
				return (
					<div
						key={achievement.name}
						className='graphVerticalBar'
						style={{
							width: `${1 / achievements.length * 100}%`,
						}}
					>
						<div
							title={achievement.hoverInfo}
							style={{
								height: `${(100 - achievement.percent) * 3}px`,
								backgroundColor: colorFill,
								opacity: 0.3
							}}
						/>
						<div
							title={achievement.hoverInfo}
							style={{
								height: `${achievement.percent * 3}px`,
								backgroundColor: colorFillAchieved
							}}
						/>
					</div>
				)
			})}
		</div>
	)
}