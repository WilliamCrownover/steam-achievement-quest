
export const getUserGames = async () => {
	const url = 'http://localhost:5000/getData'

	try {
		const res = await fetch(url);
		const json = await res.json();
		const data = json.response.games;
		const dataAchievements = await Promise.all(data.map(async (game) => {
			const achievements = await getGameAchievements(game.appid)
			return { ...game, achievements: achievements }
		}));
		return dataAchievements;
	} catch (error) {
		console.log(error);
	}
}

export const getGameAchievements = async (appId) => {
	const url = `http://localhost:5000/getGameAchievements/${appId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.achievementpercentages?.achievements;
	} catch (error) {
		console.log(error);
	}
}
