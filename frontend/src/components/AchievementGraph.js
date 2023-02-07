import { round, setColorFill } from '../utils/utils'

export const AchievementGraph = ({ game }) => {
	const achievements = game.achievements;
	const lineArray = [
		{ class: 'ninetyPercent' },
		{ class: 'fiftyPercent' },
		{ class: 'tenPercent' },
	];
	const heightFactor = 1.5;

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
								height: `${(100 - percent) * heightFactor}px`,
								backgroundColor: colorFill,
								opacity: 0.4
							}}
						/>
						<div
							title={hoverInfo}
							style={{
								height: `${percent * heightFactor}px`,
								backgroundColor: colorFillAchieved
							}}
						/>
					</div>
				)
			})}
			{lineArray.map((line) =>
				<div key={line.class} className={`horizontalGraphLine ${line.class}`} />
			)}
			<div
				className='horizontalGraphLine averagePercentLine'
				style={{ top: `${(100 - game.averagePercent) * heightFactor}px` }}
			/>
		</div>
	)
}