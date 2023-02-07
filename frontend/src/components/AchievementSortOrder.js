import { sorter, sortAlphabet, sortNumber } from '../utils/utils';

export const AchievementSortOrder = (props) => {
	const {
		userData,
		gamesWithAchievements,
		setGamesWithAchievements,
	} = props;

	const changeAchievementOrder = (e) => {
		const value = e.target.value;
		setGamesWithAchievements(gamesWithAchievements.map((game) => {
			const sortProperty = (property) => {
				const achievements = game.achievements;
				const achievementsSortedByPercent = sorter(achievements, sortNumber('percent', true));
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
			<select onChange={changeAchievementOrder} >
				<option value='name' defaultValue > Achievement ID</option>
				<option value='percent' > Global Percent Complete</option>
				{!userData.privateProfile && <option value='unlockTime' >Date Achieved</option>}
			</select>
		</div>
	)
}