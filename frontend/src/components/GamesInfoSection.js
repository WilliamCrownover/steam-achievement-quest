export const GamesInfoSection = ({gamesWithAchievements, gamesWithoutAchievements}) => {

	return (
		<>
			<h2>Total Number of Games: {gamesWithAchievements.length + gamesWithoutAchievements.length}</h2>
			<h3>Total With Achievements: {gamesWithAchievements.length}</h3>
			<h3>Total Without Achievements: {gamesWithoutAchievements.length}</h3>
			<h3>Number of Achievements: {gamesWithAchievements.reduce((total, current) => total + current.totalAchievements, 0)}</h3>
			<h3>Number of Achievements Completed: {gamesWithAchievements.reduce((total, current) => total + current.totalCompletedAchievements, 0)}</h3>
		</>
	)
}