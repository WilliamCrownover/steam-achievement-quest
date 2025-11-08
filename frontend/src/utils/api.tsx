import {
	dateFormat,
	round,
	sorter,
	sortAlphabet,
	splitStringListToArray,
	sortKeysByValue,
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
	SteamUserInfo,
} from '../models';
import { SteamWishlistItem } from '../models/SteamWishlistItem';

const serverString = 'http://localhost:5000/';

export const saveDataToBackend = async (key: string, data: any): Promise<boolean> => {
	const url = `${serverString}saveData/${key}`;
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
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

export const getOrSetFileStorage = async (
	key: string,
	defaultValue: string = '{}'
): Promise<string> => {
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
	setterGamesToLoad: React.Dispatch<React.SetStateAction<number>>,
	useWishlist = false,
	includeCurrentPlayers = false
): Promise<GameDataExpanded[] | undefined> => {
	setterGamesToLoad(0);
	const url = useWishlist
		? `${serverString}getUserWishlist/${userId}`
		: `${serverString}getOwnedGames/${userId}`;

	try {
		const res = await fetch(url);
		const json = await res.json();
		let allGamesData: SteamOwnedGame[] | SteamWishlistItem[] = useWishlist
			? json.response.items
			: json.response.games;

		// The profile is completely private and no game data is available.
		if (!allGamesData) return;

		// If a filter list is provided return games matching appids
		if (gameList.length > 0) {
			allGamesData = allGamesData.filter((game: SteamOwnedGame | SteamWishlistItem) =>
				gameList.includes(game.appid)
			);
		}

		// Filter out game demos
		if (!useWishlist) {
			allGamesData = allGamesData.filter(
				(game: SteamOwnedGame) => !game.name.toLowerCase().trim().endsWith(' demo')
			);
		}

		// Create object version of allGamesData
		const allGamesDataObject = (allGamesData as (SteamOwnedGame | SteamWishlistItem)[]).reduce(
			(
				acc: { [key: number]: SteamOwnedGame | SteamWishlistItem },
				game: SteamOwnedGame | SteamWishlistItem
			) => {
				acc[game.appid] = game;
				return acc;
			},
			{}
		);

		const gamesLength = allGamesData.length;
		const totalGameCount = sampleSize && gamesLength > 25 ? 25 : gamesLength;
		setterGamesToLoad(totalGameCount);

		// 440 is Team Fortress 2. Avoid excessive user achievement fetches if private profile.
		let publicProfileCheck = await checkForPrivateProfile(userId);

		// Get the files for game data
		const gameCosts = JSON.parse(await getOrSetFileStorage('gameCosts'));
		const gamePrices = JSON.parse(await getOrSetFileStorage('gamePrices'));
		const gameTimesToBeat = JSON.parse(await getOrSetFileStorage('gameTimesToBeat'));
		const gamePurchaseDates = JSON.parse(await getOrSetFileStorage('gamePurchaseDates'));
		const focusedGames = JSON.parse(await getOrSetFileStorage('gameFocus'));
		const gameDemos = JSON.parse(await getOrSetFileStorage('gameDemo'));
		const myReviews = JSON.parse(await getOrSetFileStorage('myReviews'));

		const gameIds = allGamesData
			.slice(0, totalGameCount)
			.map((game: SteamOwnedGame | SteamWishlistItem) => game.appid);

		const steamSpyAppDetails: {
			[key: number]: SteamSpyAppDetailsConverted | undefined;
		} = {};
		const allPlayerCounts: { [key: number]: number } = {};
		const allReviewData: { [key: number]: ReviewData } = {};
		const allAchievementsCombined: {
			[key: number]: CombinedAchievementsWithSchema[];
		} = {};

		const gameSteamSpyDetailsFile = JSON.parse(await getOrSetFileStorage('steamSpyAppDetails'));
		const gamePlayerCountFile = JSON.parse(await getOrSetFileStorage('gamePlayerCount'));
		const gameReviewsFile = JSON.parse(await getOrSetFileStorage('gameReviews'));
		const gameAchievementsFile = JSON.parse(await getOrSetFileStorage('gameAchievements'));
		const gameAchievementSchemasFile = JSON.parse(
			await getOrSetFileStorage('gameAchievementSchemas')
		);
		const gameUserAchievementsFile = JSON.parse(
			await getOrSetFileStorage('gameUserAchievements')
		);

		// Batch fetch all game data concurrently
		const {
			steamSpyUpdates,
			playerCountUpdates,
			reviewUpdates,
			achievementUpdates,
			schemaUpdates,
			userAchievementUpdates,
		} = await fetchAllGameDataConcurrently(
			gameIds,
			gameSteamSpyDetailsFile,
			gamePlayerCountFile,
			gameReviewsFile,
			gameAchievementsFile,
			gameAchievementSchemasFile,
			gameUserAchievementsFile,
			allGamesDataObject,
			userId,
			includeCurrentPlayers,
			useWishlist,
			setterGamesToLoad
		);

		// Save all updates to backend in batch
		await Promise.all(
			[
				steamSpyUpdates &&
					Object.keys(steamSpyUpdates).length > 0 &&
					saveDataToBackend('steamSpyAppDetails', {
						...gameSteamSpyDetailsFile,
						...steamSpyUpdates,
					}),
				playerCountUpdates &&
					Object.keys(playerCountUpdates).length > 0 &&
					saveDataToBackend('gamePlayerCount', {
						...gamePlayerCountFile,
						...playerCountUpdates,
					}),
				reviewUpdates &&
					Object.keys(reviewUpdates).length > 0 &&
					saveDataToBackend('gameReviews', { ...gameReviewsFile, ...reviewUpdates }),
				achievementUpdates &&
					Object.keys(achievementUpdates).length > 0 &&
					saveDataToBackend('gameAchievements', {
						...gameAchievementsFile,
						...achievementUpdates,
					}),
				schemaUpdates &&
					Object.keys(schemaUpdates).length > 0 &&
					saveDataToBackend('gameAchievementSchemas', {
						...gameAchievementSchemasFile,
						...schemaUpdates,
					}),
				userAchievementUpdates &&
					Object.keys(userAchievementUpdates).length > 0 &&
					saveDataToBackend('gameUserAchievements', {
						...gameUserAchievementsFile,
						...userAchievementUpdates,
					}),
			].filter(Boolean)
		);

		// Process the fetched data into the expected format
		for (const gameId of gameIds) {
			steamSpyAppDetails[gameId] = steamSpyUpdates[gameId] || gameSteamSpyDetailsFile[gameId];
			allPlayerCounts[gameId] =
				playerCountUpdates[gameId]?.player_count ||
				gamePlayerCountFile[gameId]?.player_count ||
				0;
			allReviewData[gameId] = reviewUpdates[gameId] ||
				gameReviewsFile[gameId] || {
					total_reviews: 0,
					total_positive: 0,
					total_negative: 0,
					pullDate: new Date(),
				};

			if (useWishlist || allGamesDataObject[gameId].has_community_visible_stats) {
				const gameAchievements = achievementUpdates[gameId] || gameAchievementsFile[gameId];
				if (gameAchievements !== undefined && gameAchievements.length > 0) {
					const gameAchievementSchema =
						schemaUpdates[gameId] || gameAchievementSchemasFile[gameId];
					allAchievementsCombined[gameId] = gameAchievements.map(
						(achievement: any, i: number) => ({
							...achievement,
							...(gameAchievementSchema?.[i] ?? {}),
							unlockDate: 'Unachieved',
							achieved: false,
							unlockTime: 0,
						})
					);
					if (!useWishlist) {
						const gameUserAchievements =
							userAchievementUpdates[gameId] || gameUserAchievementsFile[gameId];
						if (gameUserAchievements && gameUserAchievements.length > 0) {
							allAchievementsCombined[gameId] = combineAchievements(
								allAchievementsCombined[gameId],
								gameUserAchievements
							);
						}
					}
					allAchievementsCombined[gameId] = allAchievementsCombined[gameId].map(
						achievement => ({
							...achievement,
							hoverInfo: concatHoverInfo(achievement),
						})
					);
				}
			}
		}

		// Get achievement data for each game and add extra properties.
		setterGamesToLoad(totalGameCount);
		const allGamesDataExpanded: GameDataExpanded[] = await Promise.all(
			allGamesData
				.slice(0, totalGameCount)
				.map(async (game: SteamOwnedGame | SteamWishlistItem) => {
					const gameId = game.appid;
					const gameIcon = `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/header.jpg`;
					const hoursPlayed = game.playtime_forever
						? round(game.playtime_forever / 60)
						: 0;
					const lastPlayedDate = dateFormat(game.rtime_last_played);
					const gameUrl = `https://store.steampowered.com/app/${gameId}`;
					const achievementsUrl = `https://steamcommunity.com/stats/${gameId}/achievements`;
					const playerCount = allPlayerCounts[gameId] || 0;
					const reviewData = allReviewData[gameId];
					const reviewTotals = reviewData.total_reviews;
					let reviewPercentPositive = 0;
					let reviewPercentNegative = 0;
					if (reviewTotals !== 0) {
						reviewPercentPositive = round(
							(reviewData.total_positive / reviewTotals) * 100
						);
						reviewPercentNegative = round(
							(reviewData.total_negative / reviewTotals) * 100
						);
					}
					let lowestAchievementPercent = 0;
					let cost = parseFloat(gameCosts[gameId] ?? 0);
					let pricePaid = parseFloat(gamePrices[gameId] ?? 0);
					let timeToBeat = parseFloat(gameTimesToBeat[gameId] ?? 0);
					const purchaseDate = gamePurchaseDates[gameId] || '';
					const focused = focusedGames[gameId] || false;
					const demo = gameDemos[gameId] || false;
					const pricePerHour = calcPricePerHour(pricePaid, hoursPlayed);
					const costPerTimeToBeat = calcPricePerHour(cost, timeToBeat);
					const discountPercent =
						pricePaid > 0 ? round(((cost - pricePaid) / cost) * 100) : 100;
					const review = myReviews[gameId] || ReviewEnum.noReview;
					const ssAppDetails = steamSpyAppDetails[gameId];
					const urlName = (ssAppDetails?.name || game.name)
						.replace(/['’.,]/g, '')
						.replace(/[-–_|/+（）®Ⓡ™©:;"!?()[\]{}]/g, ' ')
						.replace(/&/g, '%26')
						.trim()
						.replace(/\s+/g, '+');

					// Each game will have at least these properties.
					const gameDataExpanded: GameDataExpanded = {
						...game,
						name: game.name || ssAppDetails?.name || 'Unknown',
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
						cost: isNaN(cost) ? '0' : cost.toFixed(2),
						pricePaid: isNaN(pricePaid) ? '0' : pricePaid.toFixed(2),
						timeToBeat: isNaN(timeToBeat) ? '0' : timeToBeat.toFixed(1),
						purchaseDate,
						focused,
						demo,
						isHidden: false,
						pricePerHour,
						costPerTimeToBeat,
						discountPercent: isNaN(discountPercent) ? 0 : discountPercent,
						review,
						ssAppDetails,
						ownersCount: ssAppDetails?.owners
							? parseInt(ssAppDetails.owners.split('..')[1].trim().replace(/,/g, ''))
							: 0,
						percentComplete: 0,
						youtubeUrl:
							ssAppDetails?.name || game.name
								? `https://www.youtube.com/results?search_query=lets+play+${urlName}`
								: 'No Link',
						howLongToBeatUrl:
							ssAppDetails?.name || game.name
								? `https://howlongtobeat.com/?q=${urlName}`
								: 'No Link',
					};

					// If the game has community data it likely has achievement data.
					if (
						game.has_community_visible_stats ||
						allAchievementsCombined[gameId]?.length > 0
					) {
						let achievements = allAchievementsCombined[gameId];

						// If it does indeed have achievements, elaborate the data.
						if (achievements !== undefined && achievements.length > 0) {
							lowestAchievementPercent = round(
								Math.min(...achievements.map(achievement => achievement.percent))
							);
							const totalAchievements = achievements.length;
							let totalCompletedAchievements = 0;
							let totalIncompleteAchievements = totalAchievements;
							let privateProfile = true;

							achievements = achievements.filter(
								achievement => achievement.defaultvalue !== undefined
							);

							// If the user's achievements are public, combine data and sum total completed achievements.
							if (publicProfileCheck) {
								totalCompletedAchievements = sumTotalCompleted(achievements);
								totalIncompleteAchievements -= totalCompletedAchievements;
								privateProfile = false;
							}

							const percentComplete = round(
								(totalCompletedAchievements / totalAchievements) * 100
							);

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
							};
						}
					}

					// Increment total game count to show loading progress
					setterGamesToLoad((prevCount: number) => prevCount - 1);

					return gameDataExpanded;
				})
		);

		return allGamesDataExpanded;
	} catch (error) {
		console.log(error);
	}
};

// Batch fetch all game data concurrently with throttling
const fetchAllGameDataConcurrently = async (
	gameIds: number[],
	steamSpyFile: any,
	playerCountFile: any,
	reviewsFile: any,
	achievementsFile: any,
	schemasFile: any,
	userAchievementsFile: any,
	allGamesDataObject: any,
	userId: string,
	includeCurrentPlayers: boolean,
	useWishlist: boolean,
	setterGamesToLoad: React.Dispatch<React.SetStateAction<number>>
) => {
	const BATCH_SIZE = 10; // Process 10 games at a time to avoid overwhelming the server

	// Initialize result arrays
	const steamSpyResults: any[] = [];
	const playerCountResults: any[] = [];
	const reviewResults: any[] = [];
	const achievementResults: any[] = [];
	const schemaResults: any[] = [];
	const userAchievementResults: any[] = [];

	// Process games in batches
	for (let i = 0; i < gameIds.length; i += BATCH_SIZE) {
		const batchGameIds = gameIds.slice(i, i + BATCH_SIZE);

		// Create promises for current batch
		const steamSpyPromises = batchGameIds.map(gameId =>
			getSteamSpyAppDetailsBatch(gameId, steamSpyFile[gameId])
		);

		const playerCountPromises = batchGameIds.map(gameId =>
			getGamePlayerCountBatch(gameId, playerCountFile[gameId], includeCurrentPlayers)
		);

		const reviewPromises = batchGameIds.map(gameId =>
			getGameReviewDataBatch(gameId, reviewsFile[gameId])
		);

		// Only fetch achievement data for games with community stats
		const achievementPromises = batchGameIds.map(gameId => {
			if (useWishlist || allGamesDataObject[gameId]?.has_community_visible_stats) {
				return getGameAchievementsBatch(gameId, achievementsFile[gameId]);
			}
			return Promise.resolve(null);
		});

		const schemaPromises = batchGameIds.map(gameId => {
			if (useWishlist || allGamesDataObject[gameId]?.has_community_visible_stats) {
				return getGameAchievementSchemasBatch(gameId, schemasFile[gameId]);
			}
			return Promise.resolve(null);
		});

		const userAchievementPromises = batchGameIds.map(gameId => {
			if (!useWishlist && allGamesDataObject[gameId]?.has_community_visible_stats) {
				return getUserAchievementsBatch(gameId, userId, userAchievementsFile[gameId]);
			}
			return Promise.resolve(null);
		});

		// Execute current batch concurrently
		const [
			batchSteamSpyResults,
			batchPlayerCountResults,
			batchReviewResults,
			batchAchievementResults,
			batchSchemaResults,
			batchUserAchievementResults,
		] = await Promise.all([
			Promise.all(steamSpyPromises),
			Promise.all(playerCountPromises),
			Promise.all(reviewPromises),
			Promise.all(achievementPromises),
			Promise.all(schemaPromises),
			Promise.all(userAchievementPromises),
		]);

		// Accumulate results
		steamSpyResults.push(...batchSteamSpyResults);
		playerCountResults.push(...batchPlayerCountResults);
		reviewResults.push(...batchReviewResults);
		achievementResults.push(...batchAchievementResults);
		schemaResults.push(...batchSchemaResults);
		userAchievementResults.push(...batchUserAchievementResults);

		// Decrement the loading counter for each game in this batch
		for (let j = 0; j < batchGameIds.length; j++) {
			setterGamesToLoad((prevCount: number) => prevCount - 1);
		}

		// Add a small delay between batches to be nice to the server
		if (i + BATCH_SIZE < gameIds.length) {
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	// Process results into update objects
	const steamSpyUpdates: any = {};
	const playerCountUpdates: any = {};
	const reviewUpdates: any = {};
	const achievementUpdates: any = {};
	const schemaUpdates: any = {};
	const userAchievementUpdates: any = {};

	gameIds.forEach((gameId, index) => {
		const steamSpyResult = steamSpyResults[index];
		const playerCountResult = playerCountResults[index];
		const reviewResult = reviewResults[index];
		const achievementResult = achievementResults[index];
		const schemaResult = schemaResults[index];
		const userAchievementResult = userAchievementResults[index];

		if (steamSpyResult?.updated) {
			steamSpyUpdates[gameId] = steamSpyResult.data;
		}
		if (playerCountResult?.updated) {
			playerCountUpdates[gameId] = playerCountResult.data;
		}
		if (reviewResult?.updated) {
			reviewUpdates[gameId] = reviewResult.data;
		}
		if (achievementResult?.updated) {
			achievementUpdates[gameId] = achievementResult.data;
		}
		if (schemaResult?.updated) {
			schemaUpdates[gameId] = schemaResult.data;
		}
		if (userAchievementResult?.updated) {
			userAchievementUpdates[gameId] = userAchievementResult.data;
		}
	});

	return {
		steamSpyUpdates,
		playerCountUpdates,
		reviewUpdates,
		achievementUpdates,
		schemaUpdates,
		userAchievementUpdates,
	};
};

const checkForPrivateProfile = async (userId: string): Promise<boolean> => {
	const url = `${serverString}getUserAchievements/440/${userId}`;
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Check for private profile failed: ${res.statusText}`);
		const json = await res.json();
		const userAchievements: SteamUserAchievement[] | undefined = json.playerstats.achievements;
		if (!userAchievements) return false;
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};

const getGamePlayerCountBatch = async (
	appId: number,
	playerCount: { pullDate: Date; player_count: any },
	includeCurrentPlayers: boolean
): Promise<{ updated: boolean; data: any }> => {
	const url = `${serverString}getCurrentPlayersForGame/${appId}`;

	if (
		includeCurrentPlayers &&
		(!playerCount ||
			isOver1HourOld(new Date(playerCount.pullDate)) ||
			!playerCount.player_count)
	) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch player count: ${res.statusText}`);
			const json = await res.json();
			if (!json.response) return { updated: false, data: playerCount };
			json.response.pullDate = new Date();
			return { updated: true, data: json.response };
		} catch (error) {
			console.log(error);
			return { updated: false, data: playerCount };
		}
	}
	return { updated: false, data: playerCount };
};

const getGameReviewDataBatch = async (
	appId: number,
	reviewData: ReviewData | undefined
): Promise<{ updated: boolean; data: ReviewData }> => {
	const url = `${serverString}getReviewsForGame/${appId}`;

	const noReviewData: ReviewData = {
		total_reviews: 0,
		total_positive: 0,
		total_negative: 0,
		pullDate: new Date(),
	};

	if (!reviewData || isOver24HoursOld(new Date(reviewData.pullDate))) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch steam reviews: ${res.statusText}`);
			const json = await res.json();
			let newReviewData: ReviewData | undefined = json.query_summary;
			if (!newReviewData) newReviewData = noReviewData;
			newReviewData = {
				total_reviews: newReviewData.total_reviews,
				total_positive: newReviewData.total_positive,
				total_negative: newReviewData.total_negative,
				pullDate: new Date(),
			};
			return { updated: true, data: newReviewData };
		} catch (error) {
			console.error(error);
			return { updated: false, data: reviewData || noReviewData };
		}
	}
	return { updated: false, data: reviewData };
};

const getGameAchievementsBatch = async (
	appId: number,
	achievementData: SteamAchievementConverted[] | undefined
): Promise<{ updated: boolean; data: SteamAchievementConverted[] }> => {
	const url = `${serverString}getGameAchievements/${appId}`;

	const noAchievementData: SteamAchievementConverted[] = [];

	if (
		!achievementData ||
		(achievementData.length > 0 && isOver7DaysOld(new Date(achievementData[0].pullDate)))
	) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch steam achievements: ${res.statusText}`);
			const json = await res.json();
			const achievements: SteamAchievement[] = json.achievementpercentages?.achievements;
			if (!achievements || achievements.length === 0) return { updated: false, data: [] };
			const achievementsConverted: SteamAchievementConverted[] = achievements.map(
				achievement => {
					return {
						...achievement,
						percent: parseFloat(achievement.percent),
						pullDate: new Date(),
					};
				}
			);
			return {
				updated: true,
				data: achievementsConverted
					? sorter(achievementsConverted, sortAlphabet('name'))
					: achievementsConverted,
			};
		} catch (error) {
			console.log(error);
			console.log(`No achievements found for appId: ${appId}`);
			return { updated: false, data: achievementData || noAchievementData };
		}
	}
	return { updated: false, data: achievementData };
};

const getGameAchievementSchemasBatch = async (
	appId: number,
	schemaData: SteamAchievementSchema[] | undefined
): Promise<{ updated: boolean; data: SteamAchievementSchema[] }> => {
	const url = `${serverString}getSchemaForGame/${appId}`;

	const noSchemaData: SteamAchievementSchema[] = [];

	if (
		!schemaData ||
		(schemaData.length > 0 && isOver7DaysOld(new Date(schemaData[0].pullDate)))
	) {
		try {
			const res = await fetch(url);
			if (!res.ok)
				throw new Error(`Failed to fetch steam achievement schemas: ${res.statusText}`);
			const json = await res.json();

			// Check if the response has the expected structure
			if (!json?.game?.availableGameStats?.achievements) {
				console.log(`No achievement schemas found for appId: ${appId}`);
				return { updated: false, data: [] };
			}

			const schemas: SteamAchievementSchema[] = json.game.availableGameStats.achievements;
			if (!schemas || schemas.length === 0) return { updated: false, data: [] };

			const trimmedSchemas = schemas.map(schema => {
				return {
					name: schema.name,
					defaultvalue: schema.defaultvalue,
					displayName: schema.displayName,
					description: schema.description,
					icon: schema.icon,
					pullDate: new Date(),
				};
			});
			return { updated: true, data: sorter(trimmedSchemas, sortAlphabet('name')) };
		} catch (error) {
			console.log(error);
			console.log(`Failed to fetch schemas for appId: ${appId}`);
			return { updated: false, data: schemaData || noSchemaData };
		}
	}
	return { updated: false, data: schemaData };
};

const getUserAchievementsBatch = async (
	appId: number,
	userId: string,
	userAchievementData: SteamUserAchievement[] | undefined
): Promise<{ updated: boolean; data: SteamUserAchievement[] }> => {
	const url = `${serverString}getUserAchievements/${appId}/${userId}`;

	const noUserAchievementData: SteamUserAchievement[] = [];

	if (
		!userAchievementData ||
		(userAchievementData.length > 0 &&
			isOver24HoursOld(new Date(userAchievementData[0].pullDate)))
	) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch user achievements: ${res.statusText}`);
			const json = await res.json();

			// Check if the response has the expected structure
			if (!json?.playerstats?.achievements) {
				console.log(`No user achievements found for appId: ${appId}, userId: ${userId}`);
				return { updated: false, data: [] };
			}

			const userAchievements: SteamUserAchievement[] = json.playerstats.achievements;
			if (!userAchievements || userAchievements.length === 0)
				return { updated: false, data: [] };

			const updatedUserAchievements = userAchievements.map(achievement => ({
				...achievement,
				pullDate: new Date(),
			}));
			return {
				updated: true,
				data: sorter(updatedUserAchievements, sortAlphabet('apiname')),
			};
		} catch (error) {
			console.log(error);
			console.log(`Failed to fetch user achievements for appId: ${appId}, userId: ${userId}`);
			return { updated: false, data: userAchievementData || noUserAchievementData };
		}
	}
	return { updated: false, data: userAchievementData };
};

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
};

const getSteamSpyAppDetailsBatch = async (
	appId: number,
	gameSpyData: SteamSpyAppDetailsConverted | undefined
): Promise<{ updated: boolean; data: SteamSpyAppDetailsConverted | undefined }> => {
	const url = `${serverString}getSteamSpyAppDetails/${appId}`;

	if (
		!gameSpyData ||
		isOver7DaysOld(new Date(gameSpyData.pullDate)) ||
		gameSpyData.name === 'Unknown'
	) {
		try {
			const res = await fetch(url);
			if (!res.ok)
				throw new Error(`Failed to fetch steam spy app details: ${res.statusText}`);
			const json = await res.json();
			if (!json) return { updated: false, data: gameSpyData };
			const gameSpyDataConverted: SteamSpyAppDetailsConverted = {
				name: json.name || 'Unknown',
				owners: json.owners || '0 .. 0',
				pullDate: new Date(),
				developer: splitStringListToArray(json.developer),
				genre: splitStringListToArray(json.genre),
				languages: splitStringListToArray(json.languages),
				publisher: splitStringListToArray(json.publisher),
				tags: json.tags ? sortKeysByValue(json.tags) : [],
			};
			return { updated: true, data: gameSpyDataConverted };
		} catch (error) {
			console.log(error);
			return { updated: false, data: gameSpyData };
		}
	}
	return { updated: false, data: gameSpyData };
};

// API Util Functions
const combineAchievements = (
	globalA: SteamAchievementConverted[],
	userA: SteamUserAchievement[]
) => {
	const combinedAchievements: CombinedAchievementsWithSchema[] = globalA.map((achievement, i) => {
		const userAchievement = userA[i];
		const achieved = userAchievement?.achieved === 1;
		const unlockTime =
			userAchievement?.unlocktime === 0 ? 9999999999 : userAchievement?.unlocktime;
		const unlockDate = unlockTime === 9999999999 ? 'Unachieved' : dateFormat(unlockTime);
		return { ...achievement, achieved, unlockDate, unlockTime };
	});
	return combinedAchievements;
};

const sumTotalCompleted = (achievementList: SteamAchievementConverted[]) =>
	achievementList.reduce((total, achievement) => total + achievement.achieved, 0);

const concatHoverInfo = (achievement: SteamAchievementConverted) => {
	const { displayName, description, unlockDate } = achievement;

	return `${displayName}${description ? ` - ${description}` : ''} - ${unlockDate}`;
};

const averageAchievementPercent = (achievementList: SteamAchievementConverted[]) =>
	achievementList.reduce((total, achievement) => total + achievement.percent, 0) /
	achievementList.length;

const calcPricePerHour = (price: number, hoursPlayed: number) => {
	if (price < 0 || hoursPlayed < 1) return 0;
	return round(price / hoursPlayed);
};

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
