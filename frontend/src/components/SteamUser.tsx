import {
	ChangeEvent,
	useEffect,
	useState
} from "react";
import Select from 'react-select';
import {
	getUserGameData,
	getUserInfo
} from '../utils/api'
import {
	round,
	sortAlphabeticalThenSetState
} from '../utils/utils';
import {
	GameDataExpanded,
	PassDownSteamData,
	SteamUserInfo
} from "../models";
import { UserInfoSection } from "./UserInfoSection";
import { GamesInfoSection } from "./GamesInfoSection";
import { GameSortOrder } from "./GameSortOrder";
import { AchievementSortOrder } from "./AchievementSortOrder";
import { GameWithAchievements } from "./GameWithAchievements";
import { GameWithoutAchievements } from "./GameWithoutAchievements";

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
	const [gamesWithAchievementsFiltered, setGamesWithAchievementsFiltered] = useState<GameDataExpanded[]>([]);
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState<GameDataExpanded[]>([]);
	const [gamesWithoutAchievementsFiltered, setGamesWithoutAchievementsFiltered] = useState<GameDataExpanded[]>([]);
	const [passDownSteamData, setPassDownSteamData] = useState<PassDownSteamData>();

	const [showFocusedGames, setShowFocusedGames] = useState(false);
	const [showSavedDataPoints, setShowSavedDataPoints] = useState(false);
	const [showGraph, setShowGraph] = useState(false);
	const [showList, setShowList] = useState(false);
	const [showIcons, setShowIcons] = useState(false);
	const [showSteamSpyAppDetails, setShowSteamSpyAppDetails] = useState(false);

	const [reviewFilterOptions, setReviewFilterOptions] = useState<filterOption[]>([]);
	const [selectedReviewFiltersLength, setSelectedReviewFiltersLength] = useState<number>(0);
	const [developerFilterOptions, setDeveloperFilterOptions] = useState<filterOption[]>([]);
	const [selectedDeveloperFiltersLength, setSelectedDeveloperFiltersLength] = useState<number>(0);
	const [publisherFilterOptions, setPublisherFilterOptions] = useState<filterOption[]>([]);
	const [selectedPublisherFiltersLength, setSelectedPublisherFiltersLength] = useState<number>(0);
	const [genreFilterOptions, setGenreFilterOptions] = useState<filterOption[]>([]);
	const [selectedGenreFiltersLength, setSelectedGenreFiltersLength] = useState<number>(0);
	const [tagFilterOptions, setTagFilterOptions] = useState<filterOption[]>([]);
	const [selectedTagFiltersLength, setSelectedTagFiltersLength] = useState<number>(0);

	const handleFilterChange = (
		selectedOptions: filterOption[],
		property: string,
		setFilterOptions: React.Dispatch<React.SetStateAction<filterOption[]>>,
		filterOptionsLength: number,
		setSelectedFilterOptionsLength: React.Dispatch<React.SetStateAction<number>>
	) => {
		filterGames(selectedOptions, property, setFilterOptions, filterOptionsLength, setSelectedFilterOptionsLength);
	};

	const setUniqueFilterOptions = (
		games: GameDataExpanded[],
		property: string,
		setFilterOptions: React.Dispatch<React.SetStateAction<filterOption[]>>
	) => {
		const uniqueProps = Array.from(new Set(games.flatMap(game => game.ssAppDetails?.[property] ?? game[property] ?? [])));
	
		const sortedProps = uniqueProps.sort((a, b) => 
			a.toString().localeCompare(b.toString(), undefined, {sensitivity: 'base'})
		);

		const allPropertyOptions: filterOption[] = sortedProps.map(prop => {
			const count = games.filter(game =>
				game.ssAppDetails?.[property]?.includes(prop) || game[property] === prop
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

	const filterEvery = (games: GameDataExpanded[], selectedValues: string[], property: string) => {
		return games.filter(game => 
			selectedValues.every(value => {
				if (game[property] === value) {
					return true;
				}
				
				if (Array.isArray(game.ssAppDetails?.[property]) && game.ssAppDetails?.[property].includes(value)) {
					return true;
				}
				
				return false;
			})
		);
	};

	const filterGames = (
		selectedOptions: filterOption[],
		property: string,
		setFilterOptions: React.Dispatch<React.SetStateAction<filterOption[]>>,
		filterOptionsLength: number,
		setSelectedFilterOptionsLength: React.Dispatch<React.SetStateAction<number>>
	) => {
		if (selectedOptions.length === 0) {
			setUniqueFilterOptions([...gamesWithAchievements, ...gamesWithoutAchievements], property, setFilterOptions);
			setSelectedFilterOptionsLength(0);
			setGamesWithAchievementsFiltered(gamesWithAchievements);
			setGamesWithoutAchievementsFiltered(gamesWithoutAchievements);
			return;
		}

		const selectedValues = selectedOptions.map(option => option.value);
		let filteredGamesWithAchievements: GameDataExpanded[] = [];
		let filteredGamesWithoutAchievements: GameDataExpanded[] = [];

		if (selectedOptions.length < filterOptionsLength) {
			filteredGamesWithAchievements = filterEvery(gamesWithAchievements, selectedValues, property);
			filteredGamesWithoutAchievements = filterEvery(gamesWithoutAchievements, selectedValues, property);
		} else {
			filteredGamesWithAchievements = filterEvery(gamesWithAchievementsFiltered, selectedValues, property);
			filteredGamesWithoutAchievements = filterEvery(gamesWithoutAchievementsFiltered, selectedValues, property);
		}

		setUniqueFilterOptions([...filteredGamesWithAchievements, ...filteredGamesWithoutAchievements], property, setFilterOptions);
		setSelectedFilterOptionsLength(selectedOptions.length);
		setGamesWithAchievementsFiltered(filteredGamesWithAchievements);
		setGamesWithoutAchievementsFiltered(filteredGamesWithoutAchievements);
	};

	const handleIDChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setUserId(value);
		setUserIdCheck(userIdRegex.test(value));
		e.preventDefault();
	}

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
	}

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
	}

	const getGamesData = async (user: SteamUserInfo) => {
		const gameData = await getUserGameData(user.steamid, [], sampleSize, setGamesToLoadCount);
		setLoadingGamesComplete(true);
		if (!gameData) {
			setLoadingModifiedComplete(true);
			return;
		}
		setHasGames(true);
		const gamesWithAchievementsData = gameData.filter(game => game.achievements);
		const gamesWithoutAchievementsData = gameData.filter(game => !game.achievements);
		sortAlphabeticalThenSetState(setGamesWithAchievements, gamesWithAchievementsData, 'name');
		sortAlphabeticalThenSetState(setGamesWithAchievementsFiltered, gamesWithAchievementsData, 'name');
		sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievementsData, 'name');
		sortAlphabeticalThenSetState(setGamesWithoutAchievementsFiltered, gamesWithoutAchievementsData, 'name');
		addMoreDataToUser(user, gamesWithAchievementsData, gamesWithoutAchievementsData);

		setUniqueFilterOptions(gameData, 'review', setReviewFilterOptions);
		setUniqueFilterOptions(gameData, 'developer', setDeveloperFilterOptions);
		setUniqueFilterOptions(gameData, 'publisher', setPublisherFilterOptions);
		setUniqueFilterOptions(gameData, 'genre', setGenreFilterOptions);
		setUniqueFilterOptions(gameData, 'tags', setTagFilterOptions);
	};

	const addMoreDataToUser = (user: SteamUserInfo, withAchieves: GameDataExpanded[], withoutAchieves: GameDataExpanded[]) => {
		const allGames = [...withAchieves, ...withoutAchieves];
		const totalAchievements = withAchieves.reduce(
			(total, current) => total + current.totalAchievements, 0
		);
		const totalAchievementsCompleted = withAchieves.reduce(
			(total, current) => total + current.totalCompletedAchievements, 0
		);
		setUserData({
			...user,
			privateProfile: withAchieves[0]?.privateProfile,
			totalNumberOfGames: allGames.length,
			totalAchievements,
			totalAchievementsCompleted,
			totalAchievementsIncomplete: totalAchievements - totalAchievementsCompleted,
			totalPlaytime: round(allGames.reduce(
				(total, game) => total + parseFloat(game.hoursPlayed), 0
			)),
			totalNeverPlayed: allGames.reduce(
				(total, game) => total + (game.lastPlayedDate === 'Not Played' ? 1 : 0), 0
			),
			totalOneHundredPercentComplete: allGames.reduce(
				(total, game) => total + (game.percentComplete === 100.00 ? 1 : 0), 0
			),
			totalCosts: parseFloat(allGames.reduce(
				(total, game) => {
					const cost = !isNaN(parseFloat(game.cost)) ? parseFloat(game.cost) : 0
					return total + cost
				}, 0
			).toFixed(2)),
			totalPayed: parseFloat(allGames.reduce(
				(total, game) => {
					const price = !isNaN(parseFloat(game.pricePaid)) ? parseFloat(game.pricePaid) : 0
					return total + price
				}, 0
			).toFixed(2)),
			totalTimeToBeat: parseFloat(allGames.reduce(
				(total, game) => {
					const time = !isNaN(parseFloat(game.timeToBeat)) ? parseFloat(game.timeToBeat) : 0
					return total + time
				}, 0
			).toFixed(2)),
		});
		setLoadingModifiedComplete(true);
	}

	const updateGameFocus = (gameId: number, focused: boolean) => {
		setGamesWithAchievements(prevGames => 
			prevGames.map(game => 
				game.appid === gameId ? { ...game, focused } : game
			)
		);
		setGamesWithoutAchievements(prevGames => 
			prevGames.map(game => 
				game.appid === gameId ? { ...game, focused } : game
			)
		);
	};

	useEffect(() => {
		const packageData = () => {
			if (!userData) {
				return;
			}
			setPassDownSteamData({
				userData: userData,
				gamesWithAchievements: gamesWithAchievementsFiltered,
				setGamesWithAchievements: setGamesWithAchievementsFiltered,
				gamesWithoutAchievements: gamesWithoutAchievementsFiltered,
				setGamesWithoutAchievements: setGamesWithoutAchievementsFiltered,
			});
			setPackageDataComplete(true);
		}

		(loadingUserComplete && loadingGamesComplete && loadingModifiedComplete) && packageData();
	}, [
		userData,
		gamesWithAchievements,
		gamesWithAchievementsFiltered,
		gamesWithoutAchievements,
		gamesWithoutAchievementsFiltered,
		loadingUserComplete,
		loadingGamesComplete,
		loadingModifiedComplete
	]);

	useEffect(() => {
		setUniqueFilterOptions([...gamesWithAchievementsFiltered, ...gamesWithoutAchievementsFiltered], 'review', setReviewFilterOptions);
		setUniqueFilterOptions([...gamesWithAchievementsFiltered, ...gamesWithoutAchievementsFiltered], 'developer', setDeveloperFilterOptions);
		setUniqueFilterOptions([...gamesWithAchievementsFiltered, ...gamesWithoutAchievementsFiltered], 'publisher', setPublisherFilterOptions);
		setUniqueFilterOptions([...gamesWithAchievementsFiltered, ...gamesWithoutAchievementsFiltered], 'genre', setGenreFilterOptions);
		setUniqueFilterOptions([...gamesWithAchievementsFiltered, ...gamesWithoutAchievementsFiltered], 'tags', setTagFilterOptions);
	}, [
		gamesWithAchievementsFiltered,
		gamesWithoutAchievementsFiltered,
	])

	useEffect(() => {
		if (showFocusedGames) {
			const focusedGamesWithAchievements = gamesWithAchievements.filter(game => game.focused);
			const focusedGamesWithoutAchievements = gamesWithoutAchievements.filter(game => game.focused);
			setGamesWithAchievementsFiltered(focusedGamesWithAchievements);
			setGamesWithoutAchievementsFiltered(focusedGamesWithoutAchievements);
		} else {
			setGamesWithAchievementsFiltered(gamesWithAchievements);
			setGamesWithoutAchievementsFiltered(gamesWithoutAchievements);
		}
	}, [
		showFocusedGames,
		gamesWithAchievements,
		gamesWithoutAchievements,
	]);

	useEffect(() => {
		if (userData && gamesWithAchievementsFiltered && gamesWithoutAchievementsFiltered) {
		  addMoreDataToUser(userData, gamesWithAchievementsFiltered, gamesWithoutAchievementsFiltered);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	  }, [gamesWithAchievementsFiltered, gamesWithoutAchievementsFiltered]);

	return (
		<>
			<form className='formContainer' onSubmit={handleSubmit}>
				<div>
					<label>
						Steam User ID
						<input className='userIDInput' type='text' value={userId} onChange={handleIDChange} />
					</label>
					<input type='submit' name='search' value='Search' disabled={!userIdCheck} />
				</div>
				<div>
					<label>
						Sample Size 25 Games
						<input type='checkbox' checked={sampleSize} onChange={() => setSampleSize(!sampleSize)} />
					</label>
				</div>
			</form>
			{!userIdCheck && <p className='alertTextInvert'>Not a valid User ID</p>}

			{!packageDataComplete ? (
				<h1 className='loadingText'>Loading {gamesToLoadCount} Games! Please Wait...</h1>
			) : (
				<>
					{(!firstLoad && userData && passDownSteamData) ?
						<>
							<UserInfoSection
								{...passDownSteamData}
							/>
							{hasGames ?
								<>
									<GamesInfoSection
										{...passDownSteamData}
									/>
									<div className='sortOptionContainer'>
										<GameSortOrder
											{...passDownSteamData}
										/>
										{gamesWithAchievementsFiltered.length > 0 &&
											<AchievementSortOrder
												{...passDownSteamData}
											/>
										}
										<div >
											<h4>Review</h4>
											<Select
												unstyled
												isMulti
												name='Review Filter'
												options={reviewFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												onChange={(selectedOptions: filterOption[]) => handleFilterChange(
													selectedOptions,
													'review',
													setReviewFilterOptions,
													selectedReviewFiltersLength,
													setSelectedReviewFiltersLength
												)}
											/>
										</div>
										<label>
											Focused Games
											<input
												type='checkbox'
												checked={showFocusedGames}
												onChange={() => setShowFocusedGames(!showFocusedGames)}
											/>
										</label>
										<div className='flexLineBreak' />
										<div className='filterOption'>
											<h4>Developer</h4>
											<Select
												unstyled
												isMulti
												name='Developer Filter'
												options={developerFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												onChange={(selectedOptions: filterOption[]) => handleFilterChange(
													selectedOptions,
													'developer',
													setDeveloperFilterOptions,
													selectedDeveloperFiltersLength,
													setSelectedDeveloperFiltersLength
												)}
											/>
										</div>
										<div className='filterOption'>
											<h4>Publisher</h4>
											<Select
												unstyled
												isMulti
												name='Publisher Filter'
												options={publisherFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												onChange={(selectedOptions: filterOption[]) => handleFilterChange(
													selectedOptions,
													'publisher',
													setPublisherFilterOptions,
													selectedPublisherFiltersLength,
													setSelectedPublisherFiltersLength
												)}
											/>
										</div>
										<div className='filterOption'>
											<h4>Genre</h4>
											<Select
												unstyled
												isMulti
												name='Genre Filter'
												options={genreFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												onChange={(selectedOptions: filterOption[]) => handleFilterChange(
													selectedOptions,
													'genre',
													setGenreFilterOptions,
													selectedGenreFiltersLength,
													setSelectedGenreFiltersLength
												)}
											/>
										</div>
										<div className='filterOption'>
											<h4>Tags</h4>
											<Select
												unstyled
												isMulti
												name='Tags Filter'
												options={tagFilterOptions}
												className="basic-multi-select"
												classNamePrefix="select"
												onChange={(selectedOptions: filterOption[]) => handleFilterChange(
													selectedOptions,
													'tags',
													setTagFilterOptions,
													selectedTagFiltersLength,
													setSelectedTagFiltersLength
												)}
											/>
										</div>
										<div className='flexLineBreak' />
										{gamesWithAchievementsFiltered.length > 0 &&
											<>
												<label>
													Steam Spy Data
													<input
														type='checkbox'
														checked={showSteamSpyAppDetails}
														onChange={() => setShowSteamSpyAppDetails(!showSteamSpyAppDetails)}
													/>
												</label>
												<label>
													Saved Data Points
													<input
														type='checkbox'
														checked={showSavedDataPoints}
														onChange={() => setShowSavedDataPoints(!showSavedDataPoints)}
													/>
												</label>
												<label>
													Achievement Graph
													<input
														type='checkbox'
														checked={showGraph}
														onChange={() => setShowGraph(!showGraph)}
													/>
												</label>
												<label>
													Achievement List
													<input
														type='checkbox'
														checked={showList}
														onChange={() => setShowList(!showList)}
													/>
												</label>
												<label>
													Achievement Icons
													<input
														type='checkbox'
														checked={showIcons}
														onChange={() => setShowIcons(!showIcons)}
													/>
												</label>
											</>
										}
									</div>
								</>
								: <p className='alertText'>This Steam User's game list is private.</p>
							}
						</>
						:
						(!firstLoad && <p className='alertText'>Steam User Profile does not exist.</p>)
					}
					{gamesWithAchievementsFiltered.flatMap((game) =>
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
					)}
					{(hasGames && gamesWithoutAchievementsFiltered.length > 0) &&
						<h2 className='gameWithoutAchievementsDivision'>Games Without Achievements</h2>
					}
					{gamesWithoutAchievementsFiltered.flatMap((game) =>
						<GameWithoutAchievements
							key={game.appid}
							game={game}
							showSavedDataPoints={showSavedDataPoints}
							showSteamSpyAppDetails={showSteamSpyAppDetails}
							updateGameFocus={updateGameFocus}
						/>
					)}
				</>
			)}
		</>
	)
}