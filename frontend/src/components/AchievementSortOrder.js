import { sorter, sortAlphabet, sortNumber } from '../utils/utils';

export const AchievementSortOrder = (props) => {
	const {
		userData,
		gamesWithAchievements,
		setGamesWithAchievements,
		setSortChangeOnly,
	} = props;

	const changeAchievementOrder = (e) => {
		const value = e.target.value;
		setSortChangeOnly(true);
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
		<>
			<h4>Achievement Sort Order</h4>
			<div onChange={changeAchievementOrder} className='achievementSortOrder' >
				<input type='radio' value='name' name='sortAchievements' defaultChecked /> ID Name
				<input type='radio' value='percent' name='sortAchievements' /> Global Percent Complete
				{!userData.privateProfile && <><input type='radio' value='unlockTime' name='sortAchievements' /> <span>Date Achieved</span></>}
			</div>
		</>
	)
}