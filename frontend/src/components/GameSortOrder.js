import { sorter, sortNumber, sortAlphabeticalThenSetState, sortNumberThenSetState } from '../utils/utils';

export const GameSortOrder = ({ gamesWithAchievements, setGamesWithAchievements, gamesWithoutAchievements, setGamesWithoutAchievements }) => {

	const changeGameOrder = (e) => {
		const value = e.target.value;
		sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievements, 'name');
		const sharedSort = (property) => {
			sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], property, true);
			sortNumberThenSetState(setGamesWithoutAchievements, [...gamesWithoutAchievements], property, true);
		}
		switch (true) {
			case value === 'name':
				sortAlphabeticalThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value);
				break;
			case value === 'hoursPlayed':
				sharedSort(value);
				break;
			case value === 'rtime_last_played':
				sharedSort(value);
				break;
			case value === 'totalAchievements':
				sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value);
				break;
			case value === 'percentComplete':
				sortNumberThenSetState(setGamesWithAchievements, [...sorter([...gamesWithAchievements], sortNumber('totalAchievements'))], value, true);
				break;
			case value === 'averagePercent':
				sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value, true);
				break;
			case value === 'lowestAchievementPercent':
				sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value, true);
				break;
			default:
				return;
		}
	}

	return (
		<>
			<h4>Game Sort Order</h4>
			<div onChange={changeGameOrder}>
				<input type='radio' value='name' name='sortGames' defaultChecked /> Alphabetical
				<input type='radio' value='hoursPlayed' name='sortGames' /> Playtime
				<input type='radio' value='rtime_last_played' name='sortGames' /> Last Played Date
				<input type='radio' value='totalAchievements' name='sortGames' /> Number of Achievements
				<input type='radio' value='percentComplete' name='sortGames' /> Percent Complete
				<input type='radio' value='averagePercent' name='sortGames' /> Average Global Achievement Rate
				<input type='radio' value='lowestAchievementPercent' name='sortGames' /> Lowest Achievement Percent per Game
			</div>
		</>
	)
}