import { round, setColorFill } from '../utils/utils'

export const AchievementGraph = ({ achievements }) => {

	return (
		<div className='achievementGraph'>
			{achievements.map((achievement) => {
				const {
					achieved,
					name,
					hoverInfo,
				} = achievement;
				const percent = round(achievement.percent);
				const colorFill = setColorFill(percent);
				const colorFillAchieved = setColorFill(percent, achieved);
				return (
					<div
						key={name}
						className='graphVerticalBar'
						style={{
							width: `${1 / achievements.length * 100}%`,
						}}
					>
						<div
							title={hoverInfo}
							style={{
								height: `${(100 - percent) * 3}px`,
								backgroundColor: colorFill,
								opacity: 0.3
							}}
						/>
						<div
							title={hoverInfo}
							style={{
								height: `${percent * 3}px`,
								backgroundColor: colorFillAchieved
							}}
						/>
					</div>
				)
			})}
		</div>
	)
}