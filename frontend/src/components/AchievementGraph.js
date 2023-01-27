import { round, setColorFill } from '../utils/utils'

export const AchievementGraph = ({ achievements }) => {

	return (
		<div className='completeGraph'>
			{achievements.map((achievement) => {
				const percent = round(achievement.percent);
				const colorFill = setColorFill(percent);
				return (
					<div key={achievement.name} title={achievement.hoverInfo} style={{ width: `${1 / achievements.length * 100}%`, height: `${achievement.percent * 2}px`, backgroundColor: `${achievement.achieved ? 'lightGrey' : colorFill}` }} />
				)
			})}
		</div>
	)
}