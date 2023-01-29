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
	const [sampleSize, setSampleSize] = useState(true);
	const [firstLoad, setFirstLoad] = useState(true);
	const [loading, setLoading] = useState(false);
	const [userId, setUserId] = useState('76561198035409755');
	const [userIdCheck, setUserIdCheck] = useState(true);
	const userIdRegex = new RegExp('^(7656[0-9]{13}?)$');
	const [userData, setUserData] = useState({});
	const [modifiedUserData, setModifiedUserData] = useState({});
	const [hasGames, setHasGames] = useState(false);
	const [gamesWithAchievements, setGamesWithAchievements] = useState([]);
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState([]);
	const [sortChangeOnly, setSortChangeOnly] = useState(false);
	const [passDownSteamData, setPassDownSteamData] = useState({});

	const handleIDChange = (e) => {
		const value = e.target.value;
		setUserId(value);
		setUserIdCheck(userIdRegex.test(value));
		e.preventDefault();
	}

	const reset = () => {
		setFirstLoad(false);
		setLoading(true);
		setUserData({});
		setModifiedUserData({});
		setHasGames(false);
		setGamesWithAchievements([]);
		setGamesWithoutAchievements([]);
		setSortChangeOnly(false);
		setPassDownSteamData({});
	}

	const handleSubmit = (e) => {
		const inputValue = e.target[0].value;
		const getUserData = async () => {
			reset();
			const uData = await getUserInfo(inputValue);
			setModifiedUserData(uData);
			if (!uData) {
				setLoading(false);
				return;
			}
			setUserData(uData);
		}

		getUserData();
		e.preventDefault();
	}

	useEffect(() => {
		const getGamesData = async () => {
			setLoading(true);
			const gameData = await getUserGameData(userData.steamid, sampleSize);
			if (!gameData) {
				setLoading(false);
				return;
			}
			setHasGames(true);
			const gamesWithAchievementsData = gameData.filter(game => game.achievements);
			const gamesWithoutAchievementsData = gameData.filter(game => !game.achievements);
			sortAlphabeticalThenSetState(setGamesWithAchievements, gamesWithAchievementsData, 'name');
			sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievementsData, 'name');
		};

		userData.steamid && getGamesData();
	}, [userData, sampleSize]);

	useEffect(() => {
		const addMoreDataToUser = () => {
			const allGames = [...gamesWithAchievements, ...gamesWithoutAchievements];
			setModifiedUserData({
				...userData,
				privateProfile: gamesWithAchievements[0]?.privateProfile,
				totalNumberOfGames: allGames.length,
				totalAchievements: gamesWithAchievements.reduce((total, current) => total + current.totalAchievements, 0),
				totalAchievementsCompleted: gamesWithAchievements.reduce((total, current) => total + current.totalCompletedAchievements, 0),
				totalPlaytime: round(allGames.reduce((total, game) => total + parseFloat(game.hoursPlayed), 0)),
				totalNeverPlayed: allGames.reduce((total, game) => total + (game.lastPlayedDate === 'Not Played' ? 1 : 0), 0),
			})
		}

		(!sortChangeOnly && userData.steamid && (gamesWithAchievements.length > 0 || gamesWithoutAchievements.length > 0)) && addMoreDataToUser();
	}, [sortChangeOnly, userData, gamesWithAchievements, gamesWithoutAchievements]);

	useEffect(() => {
		const packageData = () => {
			setPassDownSteamData({
				userData: modifiedUserData,
				gamesWithAchievements: gamesWithAchievements,
				setGamesWithAchievements: setGamesWithAchievements,
				gamesWithoutAchievements: gamesWithoutAchievements,
				setGamesWithoutAchievements: setGamesWithoutAchievements,
			});
			modifiedUserData.totalPlaytime && setLoading(false);
		}

		(!sortChangeOnly && modifiedUserData?.steamid) && packageData();
	}, [sortChangeOnly, modifiedUserData, gamesWithAchievements, gamesWithoutAchievements]);

	return (
		<>
			<form onSubmit={handleSubmit}>
				<label>
					Steam User ID
					<input type='text' value={userId} onChange={handleIDChange} />
				</label>
				<input type='submit' value='Submit' disabled={!userIdCheck} />
				{!userIdCheck && <p>Not a valid User ID</p>}
			</form>
			<label>
				<input type='checkbox' checked={sampleSize} onChange={() => setSampleSize(!sampleSize)} />
				Use Test Data Size: 25 Games
			</label>

			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
					{(!firstLoad && modifiedUserData) ?
						<>
							<UserInfoSection
								{...passDownSteamData}
							/>
							{hasGames ?
								<>
									<GamesInfoSection
										{...passDownSteamData}
									/>
									<GameSortOrder
										{...passDownSteamData}
									/>
									{gamesWithAchievements.length > 0 &&
										<AchievementSortOrder
											{...passDownSteamData}
											setSortChangeOnly={setSortChangeOnly}
										/>
									}
								</>
								: <p>This Steam User's game list is private.</p>
							}
						</>
						:
						(!firstLoad && <p>Steam User Profile does not exist.</p>)
					}
					{gamesWithAchievements.flatMap((game) =>
						<GameWithAchievements game={game} key={game.appid} />
					)}
					{(hasGames && gamesWithoutAchievements.length > 0) && <h2 className={'gameWithoutAchievementsDivision'}>Games Without Achievements</h2>}
					{gamesWithoutAchievements.flatMap((game) =>
						<GameWithoutAchievements game={game} key={game.appid} />
					)}
				</>
			)}
		</>
	)
}