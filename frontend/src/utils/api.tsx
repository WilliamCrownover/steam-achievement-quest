import {
	dateFormat,
	round,
	sorter,
	sortAlphabet,
	splitStringListToArray,
	sortKeysByValue
} from './utils';
import {
	CombinedAchievementsWithSchema,
	GameDataExpanded,
	ReviewData,
	ReviewEnum,
	SteamAchievement,
	SteamAchievementConverted,
	SteamAchievementSchema,
	SteamOwnedGame,
	SteamSpyAppDetailsConverted,
	SteamUserAchievement,
	SteamUserInfo
} from '../models'

const serverString = 'http://localhost:5000/';

export const saveDataToBackend = async (key: string, data: any): Promise<boolean> => {
    const url = `${serverString}saveData/${key}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch (error) {
        console.error('Failed to save data to backend:', error);
        return false;
    }
};

const loadDataFromBackend = async (key: string): Promise<any> => {
    const url = `${serverString}loadData/${key}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
		if (!key.includes('metadata')) {
        	console.error('Failed to load data from backend:', error);
		}
        return null;
    }
};

export const getOrSetFileStorage = async (key: string, defaultValue: string = '{}'): Promise<string> => {
    const data = await loadDataFromBackend(key);
    if (data !== null) {
        return JSON.stringify(data);
    }
    
	// Use the commented code to load data backups
    // const defaultData = JSON.parse(defaultValue);
    // await saveDataToBackend(key, defaultData);
    return defaultValue;
};

// Main API call to collect and process Steam data
export const getUserGameData = async (
	userId: string,
	gameList: number[],
	sampleSize = false,
	setterGamesToLoad: React.Dispatch<React.SetStateAction<number>>
): Promise<GameDataExpanded[] | undefined> => {
	setterGamesToLoad(0);
	const url = `${serverString}getOwnedGames/${userId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		let allGamesData: SteamOwnedGame[] = json.response.games;

		// The profile is completely private and no game data is available.
		if (!allGamesData) return;

		// If a filter list is provided return games matching appids
		if (gameList.length > 0) {
			allGamesData = allGamesData.filter(
				(game: SteamOwnedGame) => gameList.includes(game.appid)
			);
		}

		// Filter out game demos
		allGamesData = allGamesData.filter(
			(game: SteamOwnedGame) => !game.name.toLowerCase().trim().endsWith(' demo')
		);

		// Create object version of allGamesData
		const allGamesDataObject = allGamesData.reduce((acc: {[key: number]: SteamOwnedGame}, game: SteamOwnedGame) => {
			acc[game.appid] = game;
			return acc;
		}, {});

		const gamesLength = allGamesData.length
		const totalGameCount = (sampleSize && gamesLength > 25) ? 25 : gamesLength;
		setterGamesToLoad(totalGameCount);

		// 440 is Team Fortress 2. Avoid excessive user achievement fetches if private profile.
		let publicProfileCheck = await checkForPrivateProfile(userId);

		// Get the files for game data
		const gameCosts = JSON.parse(await getOrSetFileStorage('gameCosts'));
		const gamePrices = JSON.parse(await getOrSetFileStorage('gamePrices'));
		const gameTimesToBeat = JSON.parse(await getOrSetFileStorage('gameTimesToBeat'));
		const gamePurchaseDates = JSON.parse(await getOrSetFileStorage('gamePurchaseDates'));
		const focusedGames = JSON.parse(await getOrSetFileStorage('gameFocus'));
		const myReviews = JSON.parse(await getOrSetFileStorage('myReviews'));
		
		const gameIds = allGamesData.slice(0, totalGameCount).map((game: SteamOwnedGame) => game.appid);
		
		const steamSpyAppDetails: {[key: number]: SteamSpyAppDetailsConverted | undefined} = {};
        const allPlayerCounts: {[key: number]: number} = {};
		const allReviewData: {[key: number]: ReviewData} = {};
		const allAchievementsCombined: {[key: number]: CombinedAchievementsWithSchema[]} = {};

		for (const gameId of gameIds) {
			steamSpyAppDetails[gameId] = await getSteamSpyAppDetails(gameId);
			allPlayerCounts[gameId] = await getGamePlayerCount(gameId);
			allReviewData[gameId] = await getGameReviewData(gameId);
			if (allGamesDataObject[gameId].has_community_visible_stats) {
				const gameAchievements = await getGameAchievements(gameId);
				if (gameAchievements !== undefined && gameAchievements.length > 0) {
					const gameAchievementSchema = await getGameAchievementSchemas(gameId);
					allAchievementsCombined[gameId] = gameAchievements.map(
						(achievement, i) => (
							{
								...achievement,
								...(gameAchievementSchema?.[i] ?? {}),
								unlockDate: 'Unachieved',
								achieved: false,
								unlockTime: 0,
							}
						)
					);
					const gameUserAchievements = await getUserAchievements(gameId, userId);
					if (gameUserAchievements.length > 0) {
						allAchievementsCombined[gameId] = combineAchievements(allAchievementsCombined[gameId], gameUserAchievements);
					}
					allAchievementsCombined[gameId] = allAchievementsCombined[gameId].map(
						(achievement) => (
							{
								...achievement,
								hoverInfo: concatHoverInfo(achievement)
							}
						)
					);
				}
			}
			setterGamesToLoad((prevCount: number) => prevCount - 1);
		}

		// Get achievement data for each game and add extra properties.
		setterGamesToLoad(totalGameCount);
		const allGamesDataExpanded: GameDataExpanded[] = await Promise.all(allGamesData.slice(0, totalGameCount).map(async (game: SteamOwnedGame) => {
			const gameId = game.appid;
			const gameIcon = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${gameId}/${game.img_icon_url}.jpg`
			const hoursPlayed = round((game.playtime_forever / 60));
			const lastPlayedDate = dateFormat(game.rtime_last_played);
			const gameUrl = `https://store.steampowered.com/app/${gameId}`;
			const achievementsUrl = `https://steamcommunity.com/stats/${gameId}/achievements`;
			const playerCount = allPlayerCounts[gameId];
			const reviewData = allReviewData[gameId];
			const reviewTotals = reviewData.total_reviews;
			let reviewPercentPositive = 0;
			let reviewPercentNegative = 0;
			if (reviewTotals !== 0) {
				reviewPercentPositive = round(reviewData.total_positive / reviewTotals * 100);
				reviewPercentNegative = round(reviewData.total_negative / reviewTotals * 100);
			}
			let lowestAchievementPercent = 0;
			let cost = parseFloat(gameCosts[gameId] ?? 0);
			let pricePaid = parseFloat(gamePrices[gameId] ?? 0);
			let timeToBeat = parseFloat(gameTimesToBeat[gameId] ?? 0);
			const purchaseDate = gamePurchaseDates[gameId] || '';
			const focused = focusedGames[gameId] || false;
			const pricePerHour = calcPricePerHour(pricePaid, hoursPlayed);
			const costPerTimeToBeat = calcPricePerHour(cost, timeToBeat);
			const discountPercent = pricePaid > 0 ? round((cost - pricePaid) / cost * 100) : 100;
			const review = myReviews[gameId] || ReviewEnum.noReview;
			const ssAppDetails = steamSpyAppDetails[gameId];

			// Each game will have at least these properties.
			const gameDataExpanded: GameDataExpanded = {
				...game,
				gameIcon,
				hoursPlayed,
				lastPlayedDate,
				gameUrl,
				achievementsUrl,
				playerCount,
				...reviewData,
				reviewPercentPositive,
				reviewPercentNegative,
				lowestAchievementPercent,
				achievements: undefined,
				cost: isNaN(cost) ? "0" : cost.toFixed(2),
				pricePaid: isNaN(pricePaid) ? "0" : pricePaid.toFixed(2),
				timeToBeat: isNaN(timeToBeat) ? "0" : timeToBeat.toFixed(1),
				purchaseDate,
				focused,
				isHidden: false,
				pricePerHour,
				costPerTimeToBeat,
				discountPercent: isNaN(discountPercent) ? 0 : discountPercent,
				review,
				ssAppDetails,
				ownersCount: ssAppDetails?.owners ? parseInt(ssAppDetails.owners.split('..')[1].trim().replace(/,/g, '')) : 0,
				percentComplete: 0,
			}

			// If the game has community data it likely has achievement data.
			if (game.has_community_visible_stats) {
				let achievements = allAchievementsCombined[gameId];

				// If it does indeed have achievements, elaborate the data.
				if (achievements !== undefined && achievements.length > 0) {
					lowestAchievementPercent = round(
						Math.min(...achievements.map(
							(achievement) => achievement.percent)
						)
					);
					const totalAchievements = achievements.length;
					let totalCompletedAchievements = 0;
					let totalIncompleteAchievements = totalAchievements;
					let privateProfile = true;

					achievements = achievements.filter(achievement => achievement.defaultvalue !== undefined);

					// If the user's achievements are public, combine data and sum total completed achievements.
					if (publicProfileCheck) {
						totalCompletedAchievements = sumTotalCompleted(achievements);
						totalIncompleteAchievements -= totalCompletedAchievements;
						privateProfile = false;
					}

					const percentComplete = round((totalCompletedAchievements / totalAchievements) * 100);

					// Increment total game count to show loading progress
					setterGamesToLoad((prevCount: number) => prevCount - 1);

					return {
						...gameDataExpanded,
						achievements,
						lowestAchievementPercent,
						totalAchievements,
						totalCompletedAchievements,
						totalIncompleteAchievements,
						privateProfile,
						percentComplete,
						averagePercent: round(averageAchievementPercent(achievements)),
					}
				}
			}

			// Increment total game count to show loading progress
			setterGamesToLoad((prevCount: number) => prevCount - 1);

			return gameDataExpanded;
		}));

		return allGamesDataExpanded;
	} catch (error) {
		console.log(error);
	}
}

const checkForPrivateProfile = async (userId: string): Promise<boolean> => {
	const url = `${serverString}getUserAchievements/440/${userId}`;
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Check for private profile failed: ${res.statusText}`);
		const json = await res.json();
		const userAchievements: SteamUserAchievement[] | undefined = json.playerstats.achievements
		if (!userAchievements) return false;
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

const getGamePlayerCount = async (appId: number): Promise<number> => {
	const url = `${serverString}getCurrentPlayersForGame/${appId}`;

	const gamePlayerCount = JSON.parse(await getOrSetFileStorage('gamePlayerCount'));
	const playerCount = gamePlayerCount[appId];

	if (!playerCount || isOver1HourOld(new Date(playerCount.pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch player count: ${res.statusText}`);
			const json = await res.json();
			if (!json.response) return 0;
			json.response.pullDate = new Date();
			gamePlayerCount[appId] = json.response;
			await saveDataToBackend('gamePlayerCount', gamePlayerCount);
			return json.response.player_count;
		} catch (error) {
			console.log(error);
			return playerCount?.player_count || 0;
		}
	}
	return playerCount?.player_count || 0;
}

const getGameReviewData = async (appId: number): Promise<ReviewData> => {
	const url = `${serverString}getReviewsForGame/${appId}`;

	const gameReviews = JSON.parse(await getOrSetFileStorage('gameReviews'));
	const reviewData = gameReviews[appId];
	const noReviewData: ReviewData = {
		total_reviews: 0,
		total_positive: 0,
		total_negative: 0,
		pullDate: new Date(),
	}

	if (!reviewData || isOver24HoursOld(new Date(reviewData.pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch steam reviews: ${res.statusText}`);
			const json = await res.json();
			let reviewData: ReviewData | undefined = json.query_summary;
			if (!reviewData) reviewData = noReviewData;
			reviewData = {
				total_reviews: reviewData.total_reviews,
				total_positive: reviewData.total_positive,
				total_negative: reviewData.total_negative,
				pullDate: new Date()
			};
            gameReviews[appId] = reviewData;
            await saveDataToBackend('gameReviews', gameReviews);
			return reviewData;
		} catch (error) {
			console.error(error);
			return reviewData || noReviewData;
		}
	}
	return reviewData;
}

const getGameAchievements = async (appId: number): Promise<SteamAchievementConverted[]> => {
	const url = `${serverString}getGameAchievements/${appId}`;

	const gameAchievements = JSON.parse(await getOrSetFileStorage('gameAchievements'));
	const achievementData = gameAchievements[appId];
	const noAchievementData: SteamAchievementConverted[] = [];

	if (!achievementData || isOver7DaysOld(new Date(achievementData[0].pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch steam achievements: ${res.statusText}`);
			const json = await res.json();
			const achievements: SteamAchievement[] = json.achievementpercentages?.achievements;
			if (!achievements || achievements.length === 0) return [];
			const achievementsConverted: SteamAchievementConverted[] = achievements.map(achievement => {
				return { 
					...achievement, 
					percent: parseFloat(achievement.percent),
					pullDate: new Date()
				};
			})
            gameAchievements[appId] = achievementsConverted;
            await saveDataToBackend('gameAchievements', gameAchievements);
			return achievementsConverted ? sorter(achievementsConverted, sortAlphabet('name')) : achievementsConverted;
		} catch (error) {
			console.log(error);
			console.log(`No achievements found for appId: ${appId}`);
			return achievementData || noAchievementData;
		}
	}
	return achievementData;
}

const getGameAchievementSchemas = async (appId: number): Promise<SteamAchievementSchema[]> => {
	const url = `${serverString}getSchemaForGame/${appId}`;

	const gameAchievementSchemas = JSON.parse(await getOrSetFileStorage('gameAchievementSchemas'));
	const schemaData = gameAchievementSchemas[appId];
	const noSchemaData: SteamAchievementSchema[] = [];

	if (!schemaData || isOver7DaysOld(new Date(schemaData[0].pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch steam achievement schemas: ${res.statusText}`);
			const json = await res.json();
			const schemas: SteamAchievementSchema[] = json.game.availableGameStats.achievements;
			if (!schemas) return [];
			const trimmedSchemas = schemas.map(schema => {
				return {
					name: schema.name,
					defaultvalue: schema.defaultvalue,
					displayName: schema.displayName,
					description: schema.description,
					icon: schema.icon,
					pullDate: new Date()
				}
			});
            gameAchievementSchemas[appId] = trimmedSchemas;
            await saveDataToBackend('gameAchievementSchemas', gameAchievementSchemas);
			return sorter(trimmedSchemas, sortAlphabet('name'));
		} catch (error) {
			console.log(error);
			return schemaData || noSchemaData;
		}
	}
	return schemaData;
}

const getUserAchievements = async (appId: number, userId: string): Promise<SteamUserAchievement[]> => {
	const url = `${serverString}getUserAchievements/${appId}/${userId}`;

	const gameUserAchievements = JSON.parse(await getOrSetFileStorage('gameUserAchievements'));
	const userAchievementData = gameUserAchievements[appId];
	const noUserAchievementData: SteamUserAchievement[] = [];

	if (!userAchievementData || isOver24HoursOld(new Date(userAchievementData[0].pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch user achievements: ${res.statusText}`);
			const json = await res.json();
			const userAchievements: SteamUserAchievement[] | undefined = json.playerstats.achievements
			if (!userAchievements) return [];
            gameUserAchievements[appId] = userAchievements;
            await saveDataToBackend('gameUserAchievements', gameUserAchievements);
			return sorter(userAchievements, sortAlphabet('apiname'));
		} catch (error) {
			console.log(error);
			return userAchievementData || noUserAchievementData;
		}
	}
	return userAchievementData;
}

export const getUserInfo = async (userId: string): Promise<SteamUserInfo> => {
	const url = `${serverString}getUserInfo/${userId}`;

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch user info: ${res.statusText}`);
		const json = await res.json();
		const userInfo: SteamUserInfo | undefined = json.response.players?.[0];
		if (!userInfo) throw new Error(`User info not found for userId: ${userId}`);
		return userInfo;
	} catch (error) {
		throw error;
	}
}

export const getSteamSpyAppDetails = async (appId: number): Promise<SteamSpyAppDetailsConverted | undefined> => {
	const url = `${serverString}getSteamSpyAppDetails/${appId}`;

	const gameSteamSpyDetails = JSON.parse(await getOrSetFileStorage('steamSpyAppDetails'));
	const gameSpyData = gameSteamSpyDetails[appId];

	if (!gameSpyData || isOver7DaysOld(new Date(gameSpyData.pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch steam spy app details: ${res.statusText}`);
			const json = await res.json();
			if (!json) return;
			const gameSpyDataConverted: SteamSpyAppDetailsConverted = {
				owners: json.owners ? json.owners : '0 .. 0',
				pullDate: new Date(),
				developer: splitStringListToArray(json.developer),
				genre: splitStringListToArray(json.genre),
				languages: splitStringListToArray(json.languages),
				publisher: splitStringListToArray(json.publisher),
				tags: json.tags ? sortKeysByValue(json.tags) : [],
			}
			gameSteamSpyDetails[appId] = gameSpyDataConverted;
			await saveDataToBackend('steamSpyAppDetails', gameSteamSpyDetails);
			return gameSpyDataConverted;
		} catch (error) {
			console.log(error);
			return gameSpyData;
		}
	}
	return gameSpyData;
}

// API Util Functions
const combineAchievements = (globalA: SteamAchievementConverted[], userA: SteamUserAchievement[]) => {
	const combinedAchievements: CombinedAchievementsWithSchema[] = globalA.map((achievement, i) => {
		const userAchievement = userA[i];
		const achieved = userAchievement.achieved === 1;
		const unlockTime = userAchievement.unlocktime === 0 ? 9999999999 : userAchievement.unlocktime;
		const unlockDate = unlockTime === 9999999999 ? 'Unachieved' : dateFormat(unlockTime);
		return { ...achievement, achieved, unlockDate, unlockTime };
	})
	return combinedAchievements;
}

const sumTotalCompleted = (achievementList: SteamAchievementConverted[]) =>
	achievementList.reduce(
		(total, achievement) => total + achievement.achieved, 0
	);

const concatHoverInfo = (achievement: SteamAchievementConverted) => {
	const {
		displayName,
		description,
		unlockDate,
	} = achievement;

	return `${displayName}${description ? ` - ${description}` : ''} - ${unlockDate}`;
}

const averageAchievementPercent = (achievementList: SteamAchievementConverted[]) =>
	achievementList.reduce(
		(total, achievement) => total + achievement.percent, 0
	) / achievementList.length;

const calcPricePerHour = (price: number, hoursPlayed: number) => {
	if (price < 0 || hoursPlayed < 1) return 0;
	return round(price / hoursPlayed);
}

const isOver1HourOld = (date: Date): boolean => {
	const now = new Date();
	const diffInMilliseconds = now.getTime() - date.getTime();
	const hoursDifference = diffInMilliseconds / (1000 * 60 * 60);
	return hoursDifference > 1;
};

const isOver24HoursOld = (date: Date): boolean => {
	const now = new Date();
	const diffInMilliseconds = now.getTime() - date.getTime();
	const hoursDifference = diffInMilliseconds / (1000 * 60 * 60);
	return hoursDifference > 24;
};

const isOver7DaysOld = (date: Date): boolean => {
	const now = new Date();
	const diffInMilliseconds = now.getTime() - date.getTime();
	const dayDifference = diffInMilliseconds / (1000 * 60 * 60 * 24);
	return dayDifference > 7;
};