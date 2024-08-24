import { ChangeEvent, useEffect, useState } from "react";
import { getUserGameData, getUserInfo } from '../utils/api'
import { round, sortAlphabeticalThenSetState } from '../utils/utils';
import { UserInfoSection } from './UserInfoSection';
import { GamesInfoSection } from './GamesInfoSection';
import { GameSortOrder } from './GameSortOrder';
import { AchievementSortOrder } from './AchievementSortOrder';
import { GameWithAchievements } from './GameWithAchievements';
import { GameWithoutAchievements } from './GameWithoutAchievements';
import { GameDataExpanded, PassDownSteamData, SteamUserInfo } from "../models";

export const SteamUser = () => {
	const [firstLoad, setFirstLoad] = useState(true);
	const [sampleSize, setSampleSize] = useState(true);
	const [gamesToLoadCount, setGamesToLoadCount] = useState('');
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
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState<GameDataExpanded[]>([]);
	const [passDownSteamData, setPassDownSteamData] = useState<PassDownSteamData>();
	const [showGraph, setShowGraph] = useState(true);
	const [showList, setShowList] = useState(true);
	const [showIcons, setShowIcons] = useState(true);

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
		sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievementsData, 'name');
		addMoreDataToUser(user, gamesWithAchievementsData, gamesWithoutAchievementsData);
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
				(total, game) => total + (game.percentComplete === '100.00' ? 1 : 0), 0
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
		}

		(loadingUserComplete && loadingGamesComplete && loadingModifiedComplete) && packageData();
	}, [
		userData,
		gamesWithAchievements,
		gamesWithoutAchievements,
		loadingUserComplete,
		loadingGamesComplete,
		loadingModifiedComplete
	]);

	return (
		<>
			<form className='formContainer' onSubmit={handleSubmit}>
				<div>
					<label>
						Steam User ID
						<input type='text' value={userId} onChange={handleIDChange} />
					</label>
					<input type='submit' value='Search' disabled={!userIdCheck} />
				</div>
				<label>
					Sample Size 25 Games
					<input type='checkbox' checked={sampleSize} onChange={() => setSampleSize(!sampleSize)} />
				</label>
			</form>
			{!userIdCheck && <p className='alertTextInvert'>Not a valid User ID</p>}

			{packageDataComplete ? (
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
										{gamesWithAchievements.length > 0 &&
											<AchievementSortOrder
												{...passDownSteamData}
											/>
										}
										<div className='flexLineBreak' />
										{gamesWithAchievements.length > 0 &&
											<>
												<label>
													Show Achievement Graph
													<input 
														type='checkbox' 
														checked={showGraph} 
														onChange={() => setShowGraph(!showGraph)} 
													/>
												</label>
												<label>
													Show Achievement List
													<input 
														type='checkbox' 
														checked={showList} 
														onChange={() => setShowList(!showList)} 
													/>
												</label>
												<label>
													Show Achievement Icons
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
					{gamesWithAchievements.flatMap((game) =>
						<GameWithAchievements
							key={game.appid}
							game={game}
							privateProfile={userData?.privateProfile}
							showGraph={showGraph}
							showList={showList}
							showIcons={showIcons}
						/>
					)}
					{(hasGames && gamesWithoutAchievements.length > 0) && 
						<h2 className='gameWithoutAchievementsDivision'>Games Without Achievements</h2>
					}
					{gamesWithoutAchievements.flatMap((game) =>
						<GameWithoutAchievements game={game} key={game.appid} />
					)}
				</>
			) : (
				<h1 className='loadingText'>Loading {gamesToLoadCount} Games! Please Wait...</h1>
			)
			}
		</>
	)
}