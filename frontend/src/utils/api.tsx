import {
	dateFormat,
	round,
	sorter,
	sortAlphabet,
	getOrSetLocalStorage,
	splitStringListToArray,
	sortKeysByValue
} from './utils';
import {
	CombinedAchievements,
	GameDataExpanded,
	ReviewEnum,
	SteamAchievement,
	SteamAchievementConverted,
	SteamAchievementSchema,
	SteamOwnedGame,
	SteamSpyAppDetails,
	SteamSpyAppDetailsConverted,
	SteamUserAchievement,
	SteamUserInfo
} from '../models'
import {
	defaultGameCosts,
	defaultGamePrices,
	defaultGameTimesToBeat,
	defaultMyReviews
} from './variables';

const serverString = 'http://localhost:5000/';

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
		let allGamesData = json.response.games;

		// The profile is completely private and no game data is available.
		if (!allGamesData) return;

		// If a filter list is provided return games matching appids
		if (gameList.length > 0) {
			allGamesData = allGamesData.filter(
				(game: GameDataExpanded) => gameList.includes(game.appid)
			);
		}

		// Filter out game demos
		allGamesData = allGamesData.filter(
			(game: GameDataExpanded) => !game.name.toLowerCase().trim().endsWith(' demo')
		);

		const gamesLength = allGamesData.length
		const totalGameCount = (sampleSize && gamesLength > 25) ? 25 : gamesLength;
		setterGamesToLoad(totalGameCount);

		// 440 is Team Fortress 2. Avoid excessive user achievement fetches if private profile.
		const privacyCheckGame = await getUserAchievements(440, userId);
		let publicProfileCheck = true;
		if (privacyCheckGame === 'privateProfile') publicProfileCheck = false;

		// Get the localStorage for game data
		const gameCosts = JSON.parse(getOrSetLocalStorage('gameCosts', defaultGameCosts));
		const gamePrices = JSON.parse(getOrSetLocalStorage('gamePrices', defaultGamePrices));
		const gameTimesToBeat = JSON.parse(getOrSetLocalStorage('gameTimesToBeat', defaultGameTimesToBeat));
		const gamePurchaseDates = JSON.parse(getOrSetLocalStorage('gamePurchaseDates', "{}"));
		const focusedGames = JSON.parse(getOrSetLocalStorage('gameFocus', "{}"));
		const myReviews = JSON.parse(getOrSetLocalStorage('myReviews', defaultMyReviews));
		const steamSpyAppDetails = JSON.parse(getOrSetLocalStorage('steamSpyAppDetails', "{}"));

		// Get achievement data for each game and add extra properties.
		const allGamesDataExpanded: GameDataExpanded[] = await Promise.all(allGamesData.slice(0, totalGameCount).map(async (game: SteamOwnedGame) => {
			const gameId = game.appid;
			const gameIcon = `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${gameId}/${game.img_icon_url}.jpg`
			const hoursPlayed = round((game.playtime_forever / 60));
			const lastPlayedDate = dateFormat(game.rtime_last_played);
			const gameUrl = `https://store.steampowered.com/app/${gameId}`;
			const achievementsUrl = `https://steamcommunity.com/stats/${gameId}/achievements`;
			const playerCount = await getGamePlayerCount(gameId);
			const reviewData = await getGameReviewData(gameId);
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
				cost: isNaN(cost) ? 0 : cost.toFixed(2),
				pricePaid: isNaN(pricePaid) ? 0 : pricePaid.toFixed(2),
				timeToBeat: isNaN(timeToBeat) ? 0 : timeToBeat.toFixed(1),
				purchaseDate,
				focused,
				pricePerHour,
				costPerTimeToBeat,
				discountPercent: isNaN(discountPercent) ? 0 : discountPercent,
				review,
				ssAppDetails
			}

			// If the game has community data it likely has achievement data.
			if (game.has_community_visible_stats) {
				let achievements = await getGameAchievements(gameId);

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
					const achievementSchemas = await getGameAchievementSchemas(gameId);
					achievements = achievements.map(
						(achievement, i) => (
							{
								...achievement,
								...(achievementSchemas?.[i] ?? {}),
								unlockDate: 'Unachieved'
							}
						)
					);
					achievements = achievements.filter(achievement => achievement.defaultvalue !== undefined);

					// If the user's achievements are public, combine data and sum total completed achievements.
					if (publicProfileCheck) {
						const userAchievements = await getUserAchievements(gameId, userId);
						if (userAchievements && userAchievements !== 'privateProfile') achievements = combineAchievements(achievements, userAchievements);
						totalCompletedAchievements = sumTotalCompleted(achievements);
						totalIncompleteAchievements -= totalCompletedAchievements;
						privateProfile = false;
					}

					achievements = achievements?.map(
						(achievement) => (
							{
								...achievement,
								hoverInfo: concatHoverInfo(achievement)
							}
						)
					);
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

const getGamePlayerCount = async (appId: number) => {
	const url = `${serverString}getCurrentPlayersForGame/${appId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.response.player_count;
	} catch (error) {
		console.log(error);
	}
}

const getGameReviewData = async (appId: number) => {
	const url = `${serverString}getReviewsForGame/${appId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		return json.query_summary;
	} catch (error) {
		console.log(error);
	}
}

const getGameAchievements = async (appId: number) => {
	const url = `${serverString}getGameAchievements/${appId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		const achievements: SteamAchievement[] = json.achievementpercentages?.achievements;
		if (!achievements) return [];
		const achievementsConverted: SteamAchievementConverted[] = achievements.map(achievement => {
			return { ...achievement, percent: parseFloat(achievement.percent) };
		})
		return achievementsConverted ? sorter(achievementsConverted, sortAlphabet('name')) : achievementsConverted;
	} catch (error) {
		console.log(error);
		console.log(`No achievements found for appId: ${appId}`);
	}
}

const getGameAchievementSchemas = async (appId: number) => {
	const url = `${serverString}getSchemaForGame/${appId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		const schemas: SteamAchievementSchema[] = json.game.availableGameStats.achievements;
		return sorter(schemas, sortAlphabet('name'));
	} catch (error) {
		console.log(error);
	}
}

const getUserAchievements = async (appId: number, userId: string) => {
	const url = `${serverString}getUserAchievements/${appId}/${userId}`;

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch user achievements: ${res.statusText}`);
		const json = await res.json();
		const userAchievements: SteamUserAchievement[] | undefined = json.playerstats.achievements
		if (!userAchievements) return 'privateProfile';
		return sorter(userAchievements, sortAlphabet('apiname'));
	} catch (error) {
		throw error;
	}
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

export const getSteamSpyData = async (
	userId: string,
	gameList: number[],
	sampleSize = false,
	setterGamesToLoad: React.Dispatch<React.SetStateAction<number>>
): Promise<SteamSpyAppDetailsConverted[] | undefined> => {
	setterGamesToLoad(0);
	const url = `${serverString}getOwnedGames/${userId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		let allGamesData = json.response.games;

		// The profile is completely private and no game data is available.
		if (!allGamesData) return;

		// If a filter list is provided return games matching appids
		if (gameList.length > 0) {
			allGamesData = allGamesData.filter(
				(game: GameDataExpanded) => gameList.includes(game.appid)
			);
		}

		// Filter out game demos
		allGamesData = allGamesData.filter(
			(game: GameDataExpanded) => !game.name.toLowerCase().trim().endsWith(' demo')
		);

		const gamesLength = allGamesData.length
		const totalGameCount = (sampleSize && gamesLength > 25) ? 25 : gamesLength;
		setterGamesToLoad(totalGameCount);

		const steamSpyAppDetails = JSON.parse(getOrSetLocalStorage('steamSpyAppDetails', "{}"));

		for (const game of allGamesData.slice(0, totalGameCount)) {
			const gameId = game.appid;
			const ssAppDetails = steamSpyAppDetails[gameId];
			if (!ssAppDetails || isOver24HoursOld(new Date(ssAppDetails.pullDate))) {
				try {
					let appDetails = await getSteamSpyAppDetails(gameId);
					const appDetailsConverted: SteamSpyAppDetailsConverted = {
						...appDetails,
						developer: splitStringListToArray(appDetails.developer),
						genre: splitStringListToArray(appDetails.genre),
						languages: splitStringListToArray(appDetails.languages),
						publisher: splitStringListToArray(appDetails.publisher),
						tags: sortKeysByValue(appDetails.tags),
					}
					steamSpyAppDetails[gameId] = appDetailsConverted;
					localStorage.setItem('steamSpyAppDetails', JSON.stringify(steamSpyAppDetails));
				} catch (error) {
					console.error(`Failed to fetch details for game ${game.name}:`, error);
				}
			}
			setterGamesToLoad((prevCount: number) => prevCount - 1);
		};

	} catch (error) {
		console.log(error);
	}
}

export const getSteamSpyAppDetails = async (appId: number): Promise<SteamSpyAppDetails> => {
	const url = `${serverString}getSteamSpyAppDetails/${appId}`;

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch steam spy app details: ${res.statusText}`);
		const json = await res.json();
		const appDetails: SteamSpyAppDetails | undefined = json;
		if (!appDetails) throw new Error(`Steam Spy app details not found for appId: ${appId}`);
		appDetails.pullDate = new Date();
		return appDetails;
	} catch (error) {
		throw error;
	}
}

// API Util Functions
const combineAchievements = (globalA: SteamAchievementConverted[], userA: SteamUserAchievement[]) => {
	const combinedAchievements: CombinedAchievements[] = globalA.map((achievement, i) => {
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

const isOver24HoursOld = (date: Date): boolean => {
	const now = new Date();
	const diffInMilliseconds = now.getTime() - date.getTime();
	const hoursDifference = diffInMilliseconds / (1000 * 60 * 60);
	return hoursDifference > 24;
};