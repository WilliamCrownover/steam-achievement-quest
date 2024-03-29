import { sorter, sortNumber, sortAlphabeticalThenSetState, sortNumberThenSetState } from '../utils/utils';

export const GameSortOrder = (props) => {
	const {
		userData,
		gamesWithAchievements,
		setGamesWithAchievements,
		gamesWithoutAchievements,
		setGamesWithoutAchievements,
	} = props;

	const hasAchievements = gamesWithAchievements.length > 0;

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
			case value === 'playerCount':
				sharedSort(value);
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
			<select onChange={changeGameOrder}>
				<option value='name' defaultValue > Alphabetical</option>
				<option value='playerCount' > Current Player Count</option>
				<option value='hoursPlayed' > Playtime</option>
				<option value='rtime_last_played' > Last Played Date</option>
				{hasAchievements &&
					<>
						<option value='totalAchievements' > Number of Achievements</option>
						{!userData.privateProfile && <option value='percentComplete'>Percent Complete</option>}
						<option value='averagePercent' > Average Global Achievement Percent</option>
						<option value='lowestAchievementPercent' > Lowest Achievement Percent per Game</option>
					</>
				}
			</select>
		</>
	)
}