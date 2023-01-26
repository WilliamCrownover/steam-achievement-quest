import { sorter, sortAlphabet, sortNumber } from '../utils/utils';

export const AchievementSortOrder = ({gamesWithAchievements, setGamesWithAchievements }) => {

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
			return {...game, achievements: achievementsSorted};
		}));
	}

	return (
		<>
			<h4>Achievement Sort Order</h4>
			<div onChange={changeAchievementOrder}>
				<input type='radio' value='name' name='sortAchievements' defaultChecked /> Alphabetical
				<input type='radio' value='percent' name='sortAchievements' /> Global Percent Complete
				<input type='radio' value='unlockTime' name='sortAchievements' /> Date Achieved
			</div>
		</>
	)
}