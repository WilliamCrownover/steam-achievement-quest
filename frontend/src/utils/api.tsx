import { between, dateFormat, round, sorter, sortAlphabet } from './utils';

// Main API call to collect and process Steam data
export const getUserGameData = async (userId, sampleSize = false) => {
	const url = `http://localhost:5000/getOwnedGames/${userId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		const gamesData = json.response.games;

		// The profile is completely private and no game data is available.
		if (!gamesData) return;

		// Get the global achievement data for each game and add extra properties.
		const gamesDataGlobalAchievements = await Promise.all(gamesData.slice(0, sampleSize ? 25 : gamesData.length).map(async (game) => {
			const gameId = game.appid;
			let achievements = await getGameAchievements(gameId);
			let lowestAchievementPercent = '0';
			if (achievements) {
				lowestAchievementPercent = round(Math.min(...achievements.map((achievement) => achievement.percent)));
				achievements = achievements.map((achievement) => ({ ...achievement, unlockDate: 'Unachieved' }));
			}
			const hoursPlayed = round((game.playtime_forever / 60));
			const lastPlayedDate = dateFormat(game.rtime_last_played);
			const gameUrl = `https://store.steampowered.com/app/${gameId}`;
			return { ...game, achievements, lowestAchievementPercent, hoursPlayed, lastPlayedDate, gameUrl };
		}));

		// Get the user's achievement data and combine it with global data. Add extra properties.
		const gamesDataGlobalAndUserAchievements = await Promise.all(gamesDataGlobalAchievements.map(async (game) => {
			let achievements = game.achievements;
			// If there are achievements to process
			if (achievements && achievements?.length > 0) {
				const userAchievements = await getUserAchievements(game.appid, userId);
				const totalAchievements = achievements.length;
				let totalCompletedAchievements = 0;
				let privateProfile = true;
				// If the user's achievement data is available
				if (userAchievements !== 'privateProfile') {
					achievements = combineAchievements(achievements, userAchievements);
					totalCompletedAchievements = sumTotalCompleted(achievements);
					privateProfile = false;
				}
				achievements = achievements.map((achievement) => ({ ...achievement, hoverInfo: `${achievement.name} - ${achievement.unlockDate}` }));
				const percentComplete = round((totalCompletedAchievements / totalAchievements) * 100);
				return {
					...game,
					achievements,
					averagePercent: round(averageAchievementPercent(achievements)),
					totalAchievements,
					totalCompletedAchievements,
					percentComplete,
					achievementDifficultyDistribution: sumDistributions(achievements),
					privateProfile,
				}
			}

			return { ...game, achievements: undefined };
		}));

		return gamesDataGlobalAndUserAchievements;
	} catch (error) {
		console.log(error);
	}
}

const getGameAchievements = async (appId) => {
	const url = `http://localhost:5000/getGameAchievements/${appId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		const achievements = json.achievementpercentages?.achievements;
		return achievements ? sorter(achievements, sortAlphabet('name')) : achievements;
	} catch (error) {
		console.log(error);
	}
}

const getUserAchievements = async (appId, userId) => {
	const url = `http://localhost:5000/getUserAchievements/${appId}/${userId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.playerstats.success ? sorter(json.playerstats.achievements, sortAlphabet('apiname')) : 'privateProfile';
	} catch (error) {
		console.log(error);
	}
}

export const getUserInfo = async (userId) => {
	const url = `http://localhost:5000/getUserInfo/${userId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.response.players[0];
	} catch (error) {
		console.log(error);
	}
}

// API Util Functions
const combineAchievements = (globalA, userA) => {
	return globalA.map((achievement, i) => {
		const userAchievement = userA[i];
		const achieved = userAchievement.achieved;
		const unlockTime = userAchievement.unlocktime === 0 ? 9999999999 : userAchievement.unlocktime;
		const unlockDate = unlockTime === 9999999999 ? 'Unachieved' : dateFormat(unlockTime);
		return { ...achievement, achieved, unlockDate, unlockTime };
	})
}

const sumTotalCompleted = (achievementList) => achievementList.reduce((total, achievement) => total + achievement.achieved, 0);

const averageAchievementPercent = (achievementList) => achievementList.reduce((total, achievement) => total + achievement.percent, 0) / achievementList.length;

const sumDistributions = (achievementList) => {
	const totalByRange = (percentTop, percentBottom) => achievementList.reduce((total, achievement) => total + (between(achievement.percent, percentTop, percentBottom) ? 1 : 0), 0);
	const totalEasy = totalByRange(100, 50);
	const totalMedium = totalByRange(50, 10);
	const totalHard = totalByRange(10, 3);
	const totalImpossible = totalByRange(3, 0);
	const total = achievementList.length;
	return {
		easyPercent: round(totalEasy / total * 100),
		mediumPercent: round(totalMedium / total * 100),
		hardPercent: round(totalHard / total * 100),
		impossiblePercent: round(totalImpossible / total * 100),
	}
}