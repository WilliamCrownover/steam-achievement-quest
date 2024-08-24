import { ChangeEvent } from 'react';
import { CombinedAchievementsWithSchema, PassDownSteamData } from '../models';
import { 
	sorter, 
	sortAlphabet, 
	sortNumber 
} from '../utils/utils';

export const AchievementSortOrder = (props: PassDownSteamData) => {
	const {
		userData,
		gamesWithAchievements,
		setGamesWithAchievements,
	} = props;

	const changeAchievementOrder = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setGamesWithAchievements(gamesWithAchievements.map((game) => {
			const sortProperty = (property: string) => {
				const achievements = game.achievements;
				const achievementsSortedByPercent: CombinedAchievementsWithSchema[] = sorter(achievements, sortNumber('percent', true));
				switch (property) {
					case 'name':
						return sorter(achievements, sortAlphabet(property));
					case 'percent':
						return achievementsSortedByPercent;
					case 'unlockTime':
						return sorter(achievementsSortedByPercent, sortNumber(property));
					default:
						return [];
				}
			}
			const achievementsSorted = sortProperty(value);
			return { ...game, achievements: achievementsSorted };
		}));
	}

	return (
		<div className='sortOption'>
			<h4>Achievement Sort Order</h4>
			<select defaultValue='name' onChange={changeAchievementOrder} >
				<option value='name' > Achievement ID</option>
				<option value='percent' > Global Percent Complete</option>
				{!userData.privateProfile && <option value='unlockTime' >Date Achieved</option>}
			</select>
		</div>
	)
}