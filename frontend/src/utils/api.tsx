
export const getUserGames = async (userId) => {
	const url = `http://localhost:5000/getData/${userId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		const data = json.response.games;
		//Using slice to reduce the length of the array for testing .slice(0, 50)
		const globalAchievements = await Promise.all(data.map(async (game) => {
			const achievements = await getGameAchievements(game.appid);
			return { ...game, achievements: achievements };
		}));
		const combinedAchievements = await Promise.all(globalAchievements.map(async (game) => {
			const userAchievements = await getUserAchievements(game.appid, userId);
			const combine = combineAchievements(game.achievements, userAchievements);
			if(combine !== undefined) {combine.sort((a,b) => b.percent - a.percent)}
			const combined = {...game, achievements: combine}
			return combined;
		}));
		return combinedAchievements;
	} catch (error) {
		console.log(error);
	}
}

const getGameAchievements = async (appId) => {
	const url = `http://localhost:5000/getGameAchievements/${appId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.achievementpercentages?.achievements.sort((a,b) => a.name.localeCompare(b.name));
	} catch (error) {
		console.log(error);
	}
}

const getUserAchievements = async (appId, userId) => {
	const url = `http://localhost:5000/getUserAchievements/${appId}/${userId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.playerstats.achievements?.sort((a,b) => a.apiname.localeCompare(b.apiname));
	} catch (error) {
		console.log(error);
	}
}

const combineAchievements = (globalA, userA) => {
	if(userA === undefined ) {
		return undefined;
	} else {
		return globalA.map((achievement, i) => {
			const uAchievement = userA[i];
			return {...achievement, achieved: uAchievement.achieved, unlocktime: uAchievement.unlocktime}
		})
	}
}