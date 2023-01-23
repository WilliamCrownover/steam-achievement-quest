
export const getUserGames = async (userId) => {
	const url = `http://localhost:5000/getOwnedGames/${userId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		const data = json.response.games;
		if(data === undefined) return;
		//Using slice to reduce the length of the array for testing .slice(0, 50)
		const globalAchievements = await Promise.all(data.map(async (game) => {
			const achievements = await getGameAchievements(game.appid);
			return { ...game, achievements: achievements };
		}));
		const combinedAchievements = await Promise.all(globalAchievements.map(async (game) => {
			const gameAchievements = game.achievements;
			const userAchievements = gameAchievements && await getUserAchievements(game.appid, userId);
			const lastPlayedDate = dataFormat(game.rtime_last_played)
			const hoursPlayed = (game.playtime_forever / 60).toFixed(2);

			if(userAchievements === 'privateProfile' && gameAchievements?.length > 0 ) {
				const totalAchievements = gameAchievements.length;
				gameAchievements.sort((a, b) => b.percent - a.percent);
				return { 
					...game, 
					lastPlayedDate, 
					hoursPlayed,
					totalAchievements,
					privateProfile: true,
				}
			} else if (userAchievements === undefined || gameAchievements?.length === 0) {
				return { ...game, lastPlayedDate, hoursPlayed, achievements: undefined }
			} else {
				const combine = combineAchievements(gameAchievements, userAchievements);
				combine.sort((a, b) => b.percent - a.percent);
				const averagePercent = averageAchievementPercent(combine).toFixed(2);
				const totalAchievements = gameAchievements.length;
				const totalCompletedAchievements = sumTotalCompleted(combine);
				const percentComplete = ((totalCompletedAchievements / totalAchievements) * 100).toFixed(2);
				const achievementDifficultyDistribution = sumDistributions(combine);
				return { 
					...game, 
					lastPlayedDate,
					hoursPlayed,
					achievements: combine, 
					averagePercent,
					totalAchievements,
					totalCompletedAchievements,
					percentComplete,
					achievementDifficultyDistribution,
				}
			} 
		}));
		return combinedAchievements;
	} catch (error) {
		console.log(error);
	}
}

export const getUserInfo = async (userId) => {
	const url = `http://localhost:5000/getUserInfo/${userId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.response.players[0];
	} catch (error) {
		console.log(error);
	}
}

const getGameAchievements = async (appId) => {
	const url = `http://localhost:5000/getGameAchievements/${appId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.achievementpercentages?.achievements.sort((a, b) => a.name.localeCompare(b.name));
	} catch (error) {
		console.log(error);
	}
}

const getUserAchievements = async (appId, userId) => {
	const url = `http://localhost:5000/getUserAchievements/${appId}/${userId}`

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.playerstats.success === true ? json.playerstats.achievements?.sort((a, b) => a.apiname.localeCompare(b.apiname)) : 'privateProfile';
	} catch (error) {
		console.log(error);
	}
}

export const dataFormat = (timestamp) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', {})
}

const combineAchievements = (globalA, userA) => {
	return globalA.map((achievement, i) => {
		const uAchievement = userA[i];
		return { ...achievement, achieved: uAchievement.achieved, unlocktime: uAchievement.unlocktime }
	})
}

const averageAchievementPercent = (achievementList) => {
	const sum = (prev, cur) => ({ percent: prev.percent + cur.percent });
	const avg = achievementList.reduce(sum).percent / achievementList.length;
	return avg;
}

const sumTotalCompleted = (achievementList) => {
	let total = 0;
	achievementList.forEach((achievement) => {
		if (achievement.achieved) total += 1;
	})
	return total;
}

const sumDistributions = (achievementList) => {
	let totalEasy = 0;
	let totalMedium = 0;
	let totalHard = 0;
	let totalImpossible = 0;
	achievementList.forEach((achievement) => {
		const percent = achievement.percent;
		switch (true) {
			case percent >= 50:
				totalEasy += 1;
				break;
			case percent >= 10:
				totalMedium += 1;
				break;
			case percent >= 3:
				totalHard += 1;
				break;
			default:
				totalImpossible += 1;
		}
	});
	const total = achievementList.length;
	return {
		easyPercent: parseFloat((totalEasy/total*100).toFixed(2)),
		mediumPercent: parseFloat((totalMedium/total*100).toFixed(2)),
		hardPercent: parseFloat((totalHard/total*100).toFixed(2)),
		impossiblePercent: parseFloat((totalImpossible/total*100).toFixed(2)),
	}
}