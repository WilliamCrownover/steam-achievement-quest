import { useEffect, useState } from "react";
import { getUserGameData, getUserInfo } from '../utils/api'
import { round, sortAlphabeticalThenSetState } from '../utils/utils';
import { UserInfoSection } from './UserInfoSection';
import { GamesInfoSection } from './GamesInfoSection';
import { GameSortOrder } from './GameSortOrder';
import { AchievementSortOrder } from './AchievementSortOrder';
import { GameWithAchievements } from './GameWithAchievements';
import { GameWithoutAchievements } from './GameWithoutAchievements';

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
	const [userData, setUserData] = useState({});
	const [hasGames, setHasGames] = useState(false);
	const [gamesWithAchievements, setGamesWithAchievements] = useState([]);
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState([]);
	const [passDownSteamData, setPassDownSteamData] = useState({});

	const handleIDChange = (e) => {
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
		setUserData({});
		setHasGames(false);
		setGamesWithAchievements([]);
		setGamesWithoutAchievements([]);
		setPassDownSteamData({});
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		const inputValue = e.target[0].value;
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

	const getGamesData = async (user) => {
		const gameData = await getUserGameData(user.steamid, sampleSize, setGamesToLoadCount);
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

	const addMoreDataToUser = (user, withAchieves, withoutAchieves) => {
		const allGames = [...withAchieves, ...withoutAchieves];
		setUserData({
			...user,
			privateProfile: withAchieves[0]?.privateProfile,
			totalNumberOfGames: allGames.length,
			totalAchievements: withAchieves.reduce((total, current) => total + current.totalAchievements, 0),
			totalAchievementsCompleted: withAchieves.reduce((total, current) => total + current.totalCompletedAchievements, 0),
			totalPlaytime: round(allGames.reduce((total, game) => total + parseFloat(game.hoursPlayed), 0)),
			totalNeverPlayed: allGames.reduce((total, game) => total + (game.lastPlayedDate === 'Not Played' ? 1 : 0), 0),
		});
		setLoadingModifiedComplete(true);
	}

	useEffect(() => {
		const packageData = () => {
			setPassDownSteamData({
				userData: userData,
				gamesWithAchievements: gamesWithAchievements,
				setGamesWithAchievements: setGamesWithAchievements,
				gamesWithoutAchievements: gamesWithoutAchievements,
				setGamesWithoutAchievements: setGamesWithoutAchievements,
			});
			setPackageDataComplete(true);
		}

		(loadingUserComplete & loadingGamesComplete & loadingModifiedComplete) && packageData();
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
					{(!firstLoad && userData) ?
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
									</div>
								</>
								: <p className='alertText'>This Steam User's game list is private.</p>
							}
						</>
						:
						(!firstLoad && <p className='alertText'>Steam User Profile does not exist.</p>)
					}
					{gamesWithAchievements.flatMap((game) =>
						<GameWithAchievements game={game} key={game.appid} privateProfile={userData.privateProfile} />
					)}
					{(hasGames && gamesWithoutAchievements.length > 0) && <h2 className={'gameWithoutAchievementsDivision'}>Games Without Achievements</h2>}
					{gamesWithoutAchievements.flatMap((game) =>
						<GameWithoutAchievements game={game} key={game.appid} />
					)}
				</>
			) : (
				<h1>Loading {gamesToLoadCount} Games! Please Wait...</h1>
			)
			}
		</>
	)
}