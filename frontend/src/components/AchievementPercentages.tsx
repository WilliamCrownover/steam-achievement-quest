import { CombinedAchievementsWithSchema } from '../models'
import { 
	round, 
	setColorFill 
} from '../utils/utils'

type AchievementPercentagesProps = {
	achievements: CombinedAchievementsWithSchema[]
	showIcons: boolean
}

export const AchievementPercentages = ({ achievements, showIcons }: AchievementPercentagesProps) => {

	return (
		<div className='achievementList'>
			{achievements.map((achievement) => {
				const percent = round(achievement.percent);
				const colorFill = setColorFill(percent);
				const achieved = achievement.achieved && 'achieved'
				return (
					<div key={achievement.name} title={achievement.hoverInfo}>
						<h3 
							style={{ backgroundColor: colorFill }} 
							className={`${achieved} ${showIcons ? 'withIcons' : 'noIcons'}`}
						>{percent}</h3>
						{showIcons && 
							<img 
								src={achievement.icon} 
								alt={achievement.displayName} 
								height='40' 
								width='40' 
								loading='lazy' 
							/>
						}
					</div>
				)
			})}
		</div>
	)
}
