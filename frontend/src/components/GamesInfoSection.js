import { round, percent } from '../utils/utils';

export const GamesInfoSection = (props) => {
	const {
		userData,
		gamesWithAchievements,
		gamesWithoutAchievements,
	} = props;

	const {
		privateProfile,
		totalNumberOfGames,
		totalAchievements,
		totalAchievementsCompleted,
		totalPlaytime,
		totalNeverPlayed,
	} = userData;

	return (
		<>
			<h2>Total Number of Games: {totalNumberOfGames}</h2>
			<h3>Total With Achievements: {gamesWithAchievements.length} - {percent(gamesWithAchievements.length, totalNumberOfGames)}</h3>
			<h3>Total Without Achievements: {gamesWithoutAchievements.length} - {percent(gamesWithoutAchievements.length, totalNumberOfGames)}</h3>
			<h3>Number of Achievements: {totalAchievements}</h3>
			{privateProfile ? 
				<p>This Steam user's achievements completed data is private.</p>
				: 
				<h3>Number of Achievements Completed: {totalAchievementsCompleted} - {percent(totalAchievementsCompleted, totalAchievements)}</h3>
			}
			<h3>Total Time Played: {totalPlaytime} Hours - {round(totalPlaytime/24)} Days - {round(totalPlaytime/24/7)} Weeks - {round(totalPlaytime/24/7/52)} Years</h3>
			<h3>Total Games Never Played: {totalNeverPlayed} - {percent(totalNeverPlayed, totalNumberOfGames)}</h3>
		</>
	)
}