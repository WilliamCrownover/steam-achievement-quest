import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { getUserGameData, getUserInfo } from '../utils/api';
import { round, sortAlphabeticalThenSetState } from '../utils/utils';
import { GameDataExpanded, PassDownSteamData, SteamUserInfo } from '../models';
import { UserInfoSection } from './UserInfoSection';
import { GamesInfoSection } from './GamesInfoSection';
import { GameSortOrder } from './GameSortOrder';
import { AchievementSortOrder } from './AchievementSortOrder';
import { GameWithAchievements } from './GameWithAchievements';
import { GameWithoutAchievements } from './GameWithoutAchievements';

type filterOption = {
	value: string;
	label: string;
	count: number;
};

export const SteamUser = () => {
	const [firstLoad, setFirstLoad] = useState(true);
	const [sampleSize, setSampleSize] = useState(true);
	const [gamesToLoadCount, setGamesToLoadCount] = useState(0);
	const [loadingUserComplete, setLoadingUserComplete] = useState(true);
	const [loadingGamesComplete, setLoadingGamesComplete] = useState(true);
	const [loadingModifiedComplete, setLoadingModifiedComplete] = useState(true);
	const [packageDataComplete, setPackageDataComplete] = useState(true);
	const [userId, setUserId] = useState('76561198035409755');
	const [userIdCheck, setUserIdCheck] = useState(true);
	const userIdRegex = new RegExp('^(7656[0-9]{13}?)$');
	const [userData, setUserData] = useState<SteamUserInfo>();
	const [hasGames, setHasGames] = useState(false);

	const [gamesWithAchievements, setGamesWithAchievements] = useState<GameDataExpanded[]>([]);
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState<GameDataExpanded[]>(
		[]
	);
	const [passDownSteamData, setPassDownSteamData] = useState<PassDownSteamData>();

	const gamesWithAchievementsRef = useRef<GameDataExpanded[]>([]);
	const gamesWithoutAchievementsRef = useRef<GameDataExpanded[]>([]);

	useEffect(() => {
		gamesWithAchievementsRef.current = gamesWithAchievements;
		gamesWithoutAchievementsRef.current = gamesWithoutAchievements;
	}, [gamesWithAchievements, gamesWithoutAchievements]);

	const [includeCurrentPlayers, setIncludeCurrentPlayers] = useState(false);
	const [showFocusedGames, setShowFocusedGames] = useState(false);
	const [showSavedDataPoints, setShowSavedDataPoints] = useState(false);
	const [showGraph, setShowGraph] = useState(false);
	const [showList, setShowList] = useState(false);
	const [showIcons, setShowIcons] = useState(false);
	const [showSteamSpyAppDetails, setShowSteamSpyAppDetails] = useState(false);

	const [reviewFilterOptions, setReviewFilterOptions] = useState<filterOption[]>([]);
	const [selectedReviewFilters, setSelectedReviewFilters] = useState<filterOption[]>([]);
	const [developerFilterOptions, setDeveloperFilterOptions] = useState<filterOption[]>([]);
	const [selectedDeveloperFilters, setSelectedDeveloperFilters] = useState<filterOption[]>([]);
	const [publisherFilterOptions, setPublisherFilterOptions] = useState<filterOption[]>([]);
	const [selectedPublisherFilters, setSelectedPublisherFilters] = useState<filterOption[]>([]);
	const [genreFilterOptions, setGenreFilterOptions] = useState<filterOption[]>([]);
	const [selectedGenreFilters, setSelectedGenreFilters] = useState<filterOption[]>([]);
	const [tagFilterOptions, setTagFilterOptions] = useState<filterOption[]>([]);
	const [selectedTagFilters, setSelectedTagFilters] = useState<filterOption[]>([]);

	const getVisibleGames = (games: GameDataExpanded[]) => {
		return games.filter(game => !game.isHidden);
	};

	const handleFilterChange = (
		selectedOptions: filterOption[],
		property: string,
		setSelectedFilters: React.Dispatch<React.SetStateAction<filterOption[]>>
	) => {
		setSelectedFilters(selectedOptions);
		applyAllFilters(selectedOptions, property);
	};

	const applyAllFilters = useCallback(
		(changedOptions?: filterOption[], changedProperty?: string) => {
			const reviewFilters =
				changedProperty === 'review' ? changedOptions : selectedReviewFilters;
			const developerFilters =
				changedProperty === 'developer' ? changedOptions : selectedDeveloperFilters;
			const publisherFilters =
				changedProperty === 'publisher' ? changedOptions : selectedPublisherFilters;
			const genreFilters =
				changedProperty === 'genre' ? changedOptions : selectedGenreFilters;
			const tagFilters = changedProperty === 'tags' ? changedOptions : selectedTagFilters;

			const allGames = [
				...gamesWithAchievementsRef.current,
				...gamesWithoutAchievementsRef.current,
			];

			const updatedGames = allGames.map(game => {
				let isHidden = false;

				// Apply focus filter
				if (showFocusedGames && !game.focused) {
					isHidden = true;
				}

				// Apply property filters
				if (!isHidden && reviewFilters && reviewFilters.length > 0) {
					const reviewValues = reviewFilters.map(option => option.value);
					if (!reviewValues.includes(game.review)) {
						isHidden = true;
					}
				}

				if (!isHidden && developerFilters && developerFilters.length > 0) {
					const developerValues = developerFilters.map(option => option.value);
					if (
						!developerValues.includes(game.developer) &&
						!game.ssAppDetails?.developer?.some(dev => developerValues.includes(dev))
					) {
						isHidden = true;
					}
				}

				if (!isHidden && publisherFilters && publisherFilters.length > 0) {
					const publisherValues = publisherFilters.map(option => option.value);
					if (
						!publisherValues.includes(game.publisher) &&
						!game.ssAppDetails?.publisher?.some(pub => publisherValues.includes(pub))
					) {
						isHidden = true;
					}
				}

				if (!isHidden && genreFilters && genreFilters.length > 0) {
					const genreValues = genreFilters.map(option => option.value);
					if (!game.ssAppDetails?.genre?.some(genre => genreValues.includes(genre))) {
						isHidden = true;
					}
				}

				if (!isHidden && tagFilters && tagFilters.length > 0) {
					const tagValues = tagFilters.map(option => option.value);
					if (!game.ssAppDetails?.tags?.some(tag => tagValues.includes(tag))) {
						isHidden = true;
					}
				}

				return { ...game, isHidden };
			});

			const updatedWithAchievements = updatedGames.filter(game => game.achievements);
			const updatedWithoutAchievements = updatedGames.filter(game => !game.achievements);

			setGamesWithAchievements(updatedWithAchievements);
			setGamesWithoutAchievements(updatedWithoutAchievements);

			const visibleGames = updatedGames.filter(game => !game.isHidden);
			setUniqueFilterOptions(visibleGames, 'review', setReviewFilterOptions);
			setUniqueFilterOptions(visibleGames, 'developer', setDeveloperFilterOptions);
			setUniqueFilterOptions(visibleGames, 'publisher', setPublisherFilterOptions);
			setUniqueFilterOptions(visibleGames, 'genre', setGenreFilterOptions);
			setUniqueFilterOptions(visibleGames, 'tags', setTagFilterOptions);
		},
		[
			selectedReviewFilters,
			selectedDeveloperFilters,
			selectedPublisherFilters,
			selectedGenreFilters,
			selectedTagFilters,
			showFocusedGames,
		]
	);

	const setUniqueFilterOptions = (
		games: GameDataExpanded[],
		property: string,
		setFilterOptions: React.Dispatch<React.SetStateAction<filterOption[]>>
	) => {
		const uniqueProps = Array.from(
			new Set(games.flatMap(game => game.ssAppDetails?.[property] ?? game[property] ?? []))
		);

		const sortedProps = uniqueProps.sort((a, b) =>
			a.toString().localeCompare(b.toString(), undefined, { sensitivity: 'base' })
		);

		const allPropertyOptions: filterOption[] = sortedProps.map(prop => {
			const count = games.filter(
				game => game.ssAppDetails?.[property]?.includes(prop) || game[property] === prop
			).length;

			return {
				count: count,
				value: prop,
				label: `(${count}) ${prop}`,
			};
		});

		const sortedOptions = allPropertyOptions.sort((a, b) => {
			const countDiff = b.count - a.count;
			if (countDiff !== 0) return countDiff;
			return (a.value as string).localeCompare(b.value as string);
		});

		setFilterOptions(sortedOptions);
	};

	const handleIDChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUserId(value);
		setUserIdCheck(userIdRegex.test(value));
		e.preventDefault();
	};

	const reset = () => {
		setFirstLoad(false);
		setLoadingUserComplete(false);
		setLoadingGamesComplete(false);
		setLoadingModifiedComplete(false);
		setPackageDataComplete(false);
		setUserData(undefined);
		setHasGames(false);
		setGamesWithAchievements([]);
		setGamesWithoutAchievements([]);
		setPassDownSteamData(undefined);
		setSelectedReviewFilters([]);
		setSelectedDeveloperFilters([]);
		setSelectedPublisherFilters([]);
		setSelectedGenreFilters([]);
		setSelectedTagFilters([]);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		reset();
		const uData = await getUserInfo(inputValue);
		setUserData(uData);
		setLoadingUserComplete(true);
		if (!uData) {
			setLoadingGamesComplete(true);
			setLoadingModifiedComplete(true);
			return;
		}
		getGamesData(uData);
	};

	const getGamesData = async (user: SteamUserInfo) => {
		const gameData = await getUserGameData(
			user.steamid,
			[],
			sampleSize,
			setGamesToLoadCount,
			includeCurrentPlayers
		);
		setLoadingGamesComplete(true);
		if (!gameData) {
			setLoadingModifiedComplete(true);
			return;
		}
		setHasGames(true);

		const gamesWithAchievementsData = gameData.filter(game => game.achievements);
		const gamesWithoutAchievementsData = gameData.filter(game => !game.achievements);

		sortAlphabeticalThenSetState(setGamesWithAchievements, gamesWithAchievementsData, 'name');
		sortAlphabeticalThenSetState(
			setGamesWithoutAchievements,
			gamesWithoutAchievementsData,
			'name'
		);
		addMoreDataToUser(user, gamesWithAchievementsData, gamesWithoutAchievementsData);

		setUniqueFilterOptions(gameData, 'review', setReviewFilterOptions);
		setUniqueFilterOptions(gameData, 'developer', setDeveloperFilterOptions);
		setUniqueFilterOptions(gameData, 'publisher', setPublisherFilterOptions);
		setUniqueFilterOptions(gameData, 'genre', setGenreFilterOptions);
		setUniqueFilterOptions(gameData, 'tags', setTagFilterOptions);
	};

	const addMoreDataToUser = (
		user: SteamUserInfo,
		withAchieves: GameDataExpanded[],
		withoutAchieves: GameDataExpanded[]
	) => {
		// Use visible games for calculations
		const visibleWithAchieves = getVisibleGames(withAchieves);
		const visibleWithoutAchieves = getVisibleGames(withoutAchieves);
		const allVisibleGames = [...visibleWithAchieves, ...visibleWithoutAchieves];

		const totalAchievements = visibleWithAchieves.reduce(
			(total, current) => total + current.totalAchievements,
			0
		);
		const totalAchievementsCompleted = visibleWithAchieves.reduce(
			(total, current) => total + current.totalCompletedAchievements,
			0
		);
		setUserData({
			...user,
			privateProfile: withAchieves[0]?.privateProfile,
			totalNumberOfGames: allVisibleGames.length,
			totalAchievements,
			totalAchievementsCompleted,
			totalAchievementsIncomplete: totalAchievements - totalAchievementsCompleted,
			totalPlaytime: round(
				allVisibleGames.reduce((total, game) => total + parseFloat(game.hoursPlayed), 0)
			),
			totalNeverPlayed: allVisibleGames.reduce(
				(total, game) => total + (game.lastPlayedDate === 'Not Played' ? 1 : 0),
				0
			),
			totalOneHundredPercentComplete: allVisibleGames.reduce(
				(total, game) => total + (game.percentComplete === 100.0 ? 1 : 0),
				0
			),
			totalCosts: parseFloat(
				allVisibleGames
					.reduce((total, game) => {
						const cost = !isNaN(parseFloat(game.cost)) ? parseFloat(game.cost) : 0;
						return total + cost;
					}, 0)
					.toFixed(2)
			),
			totalPayed: parseFloat(
				allVisibleGames
					.reduce((total, game) => {
						const price = !isNaN(parseFloat(game.pricePaid))
							? parseFloat(game.pricePaid)
							: 0;
						return total + price;
					}, 0)
					.toFixed(2)
			),
			totalTimeToBeat: parseFloat(
				allVisibleGames
					.reduce((total, game) => {
						const time = !isNaN(parseFloat(game.timeToBeat))
							? parseFloat(game.timeToBeat)
							: 0;
						return total + time;
					}, 0)
					.toFixed(2)
			),
		});
		setLoadingModifiedComplete(true);
	};

	const updateGameFocus = (gameId: number, focused: boolean) => {
		setGamesWithAchievements(prevGames =>
			prevGames.map(game => (game.appid === gameId ? { ...game, focused } : game))
		);
		setGamesWithoutAchievements(prevGames =>
			prevGames.map(game => (game.appid === gameId ? { ...game, focused } : game))
		);
	};

	useEffect(() => {
		const packageData = () => {
			if (!userData) {
				return;
			}
			setPassDownSteamData({
				userData: userData,
				gamesWithAchievements: gamesWithAchievements,
				setGamesWithAchievements: setGamesWithAchievements,
				gamesWithoutAchievements: gamesWithoutAchievements,
				setGamesWithoutAchievements: setGamesWithoutAchievements,
			});
			setPackageDataComplete(true);
		};

		loadingUserComplete && loadingGamesComplete && loadingModifiedComplete && packageData();
	}, [
		userData,
		gamesWithAchievements,
		gamesWithoutAchievements,
		loadingUserComplete,
		loadingGamesComplete,
		loadingModifiedComplete,
	]);

	useEffect(() => {
		applyAllFilters();
	}, [showFocusedGames, applyAllFilters]);

	useEffect(() => {
		if (userData && gamesWithAchievements && gamesWithoutAchievements) {
			addMoreDataToUser(userData, gamesWithAchievements, gamesWithoutAchievements);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gamesWithAchievements, gamesWithoutAchievements]);

	return (
		<>
			<form className="formContainer" onSubmit={handleSubmit}>
				<div>
					<label>
						Steam User ID
						<input
							className="userIDInput"
							type="text"
							value={userId}
							onChange={handleIDChange}
						/>
					</label>
					<input type="submit" name="search" value="Search" disabled={!userIdCheck} />
				</div>
				<div>
					<label>
						Get Current Player Counts (Slow Loading)
						<input
							type="checkbox"
							checked={includeCurrentPlayers}
							onChange={() => setIncludeCurrentPlayers(!includeCurrentPlayers)}
						/>
					</label>
					<label className="sampleSizeLabel">
						Sample Size 25 Games
						<input
							type="checkbox"
							checked={sampleSize}
							onChange={() => setSampleSize(!sampleSize)}
						/>
					</label>
				</div>
			</form>
			{!userIdCheck && <p className="alertTextInvert">Not a valid User ID</p>}

			{!packageDataComplete ? (
				<h1 className="loadingText">Loading {gamesToLoadCount} Games! Please Wait...</h1>
			) : (
				<>
					{!firstLoad && userData && passDownSteamData ? (
						<>
							<UserInfoSection {...passDownSteamData} />
							{hasGames ? (
								<>
									<GamesInfoSection {...passDownSteamData} />
									<div className="sortOptionContainer">
										<GameSortOrder {...passDownSteamData} />
										{getVisibleGames(gamesWithAchievements).length > 0 && (
											<AchievementSortOrder {...passDownSteamData} />
										)}
										<div>
											<h4>Review</h4>
											<Select
												unstyled
												isMulti
												name="Review Filter"
												options={reviewFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												value={selectedReviewFilters}
												onChange={(selectedOptions: filterOption[]) =>
													handleFilterChange(
														selectedOptions,
														'review',
														setSelectedReviewFilters
													)
												}
											/>
										</div>
										<label>
											Focused Games
											<input
												type="checkbox"
												checked={showFocusedGames}
												onChange={() =>
													setShowFocusedGames(!showFocusedGames)
												}
											/>
										</label>
										<div className="flexLineBreak" />
										<div className="filterOption">
											<h4>Developer</h4>
											<Select
												unstyled
												isMulti
												name="Developer Filter"
												options={developerFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												value={selectedDeveloperFilters}
												onChange={(selectedOptions: filterOption[]) =>
													handleFilterChange(
														selectedOptions,
														'developer',
														setSelectedDeveloperFilters
													)
												}
											/>
										</div>
										<div className="filterOption">
											<h4>Publisher</h4>
											<Select
												unstyled
												isMulti
												name="Publisher Filter"
												options={publisherFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												value={selectedPublisherFilters}
												onChange={(selectedOptions: filterOption[]) =>
													handleFilterChange(
														selectedOptions,
														'publisher',
														setSelectedPublisherFilters
													)
												}
											/>
										</div>
										<div className="filterOption">
											<h4>Genre</h4>
											<Select
												unstyled
												isMulti
												name="Genre Filter"
												options={genreFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												value={selectedGenreFilters}
												onChange={(selectedOptions: filterOption[]) =>
													handleFilterChange(
														selectedOptions,
														'genre',
														setSelectedGenreFilters
													)
												}
											/>
										</div>
										<div className="filterOption">
											<h4>Tags</h4>
											<Select
												unstyled
												isMulti
												name="Tags Filter"
												options={tagFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												value={selectedTagFilters}
												onChange={(selectedOptions: filterOption[]) =>
													handleFilterChange(
														selectedOptions,
														'tags',
														setSelectedTagFilters
													)
												}
											/>
										</div>
										<div className="flexLineBreak" />
										{getVisibleGames(gamesWithAchievements).length > 0 && (
											<>
												<label>
													Steam Spy Data
													<input
														type="checkbox"
														checked={showSteamSpyAppDetails}
														onChange={() =>
															setShowSteamSpyAppDetails(
																!showSteamSpyAppDetails
															)
														}
													/>
												</label>
												<label>
													Saved Data Points
													<input
														type="checkbox"
														checked={showSavedDataPoints}
														onChange={() =>
															setShowSavedDataPoints(
																!showSavedDataPoints
															)
														}
													/>
												</label>
												<label>
													Achievement Graph
													<input
														type="checkbox"
														checked={showGraph}
														onChange={() => setShowGraph(!showGraph)}
													/>
												</label>
												<label>
													Achievement List
													<input
														type="checkbox"
														checked={showList}
														onChange={() => setShowList(!showList)}
													/>
												</label>
												<label>
													Achievement Icons
													<input
														type="checkbox"
														checked={showIcons}
														onChange={() => setShowIcons(!showIcons)}
													/>
												</label>
											</>
										)}
									</div>
								</>
							) : (
								<p className="alertText">This Steam User's game list is private.</p>
							)}
						</>
					) : (
						!firstLoad && (
							<p className="alertText">Steam User Profile does not exist.</p>
						)
					)}
					{gamesWithAchievements
						.filter(game => !game.isHidden)
						.map(game => (
							<GameWithAchievements
								key={game.appid}
								game={game}
								privateProfile={userData?.privateProfile}
								showSavedDataPoints={showSavedDataPoints}
								showGraph={showGraph}
								showList={showList}
								showIcons={showIcons}
								showSteamSpyAppDetails={showSteamSpyAppDetails}
								updateGameFocus={updateGameFocus}
							/>
						))}
					{hasGames && getVisibleGames(gamesWithoutAchievements).length > 0 && (
						<h2 className="gameWithoutAchievementsDivision">
							Games Without Achievements
						</h2>
					)}
					{gamesWithoutAchievements
						.filter(game => !game.isHidden)
						.map(game => (
							<GameWithoutAchievements
								key={game.appid}
								game={game}
								showSavedDataPoints={showSavedDataPoints}
								showSteamSpyAppDetails={showSteamSpyAppDetails}
								updateGameFocus={updateGameFocus}
							/>
						))}
				</>
			)}
		</>
	);
};
