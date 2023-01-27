import { useState } from "react";
import { getUserGameData, getUserInfo } from '../utils/api'
import { sortAlphabeticalThenSetState } from '../utils/utils';
import { UserInfoSection } from './UserInfoSection';
import { GamesInfoSection } from './GamesInfoSection';
import { GameSortOrder } from './GameSortOrder';
import { AchievementSortOrder } from './AchievementSortOrder';
import { GameWithAchievements } from './GameWithAchievements';


export const SteamUser = () => {
	const [sampleSize, setSampleSize] = useState(true);
	const [userId, setUserId] = useState('76561198035409755');
	const [userIdCheck, setUserIdCheck] = useState(true);
	const userIdRegex = new RegExp('^(7656[0-9]{13}?)$');
	const [userData, setUserData] = useState({});
	const [firstLoad, setFirstLoad] = useState(true);
	const [loading, setLoading] = useState(false);
	const [hasGames, setHasGames] = useState(false);
	const [gamesWithAchievements, setGamesWithAchievements] = useState([]);
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState([]);

	const handleChange = (e) => {
		const value = e.target.value;
		setUserId(value);
		setUserIdCheck(userIdRegex.test(value));
	}

	const reset = () => {
		setFirstLoad(false);
		setLoading(true);
		setUserData({});
		setGamesWithAchievements([]);
		setGamesWithoutAchievements([]);
		setHasGames(false);
	}

	const handleSubmit = (e) => {
		const inputValue = e.target[0].value;
		const getUserData = async () => {
			reset();
			const uData = await getUserInfo(inputValue);
			setUserData(uData);
			if (uData === undefined) {
				setLoading(false);
				return;
			}
			getData();
		}

		const getData = async () => {
			const allData = await getUserGameData(inputValue, sampleSize);
			if (allData === undefined) {
				setLoading(false);
				return;
			}
			setHasGames(true);
			const gamesWithAchievementsData = allData.filter(game => game.achievements !== undefined);
			const gamesWithoutAchievementsData = allData.filter(game => game.achievements === undefined);
			sortAlphabeticalThenSetState(setGamesWithAchievements, gamesWithAchievementsData, 'name');
			sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievementsData, 'name');
			setLoading(false);
		};

		getUserData();
		e.preventDefault();
	}

	const displayTitleInfo = (game) => {
		return (
			<div className='gameTitleInfo'>
				<h2>{game.name}</h2>
				{game.hoursPlayed > 0 && <p>{`${game.hoursPlayed} Hours Played`}</p>}
				<p>{game.lastPlayedDate}</p>
			</div>
		)
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<label>
					Steam User ID
					<input type='text' value={userId} onChange={handleChange} />
				</label>
				<input type='submit' value='Submit' disabled={!userIdCheck} />
				{!userIdCheck && <p>Not a valid User ID</p>}
			</form>
			<label>
				<input type='checkbox' checked={sampleSize} onChange={() => setSampleSize(!sampleSize)} />
				Use Test Data Size: 25 Games
			</label>
			{gamesWithAchievements[0]?.privateProfile && <p>This Steam user's achievements completed data is private.</p>}

			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
					{(!firstLoad && userData) ?
						<>
							<UserInfoSection
								userData={userData}
							/>
							{hasGames ?
								<>
									<GamesInfoSection
										gamesWithAchievements={gamesWithAchievements}
										gamesWithoutAchievements={gamesWithoutAchievements}
									/>
									<GameSortOrder
										gamesWithAchievements={gamesWithAchievements}
										setGamesWithAchievements={setGamesWithAchievements}
										gamesWithoutAchievements={gamesWithoutAchievements}
										setGamesWithoutAchievements={setGamesWithoutAchievements}
									/>
									{gamesWithAchievements.length > 0 &&
										<AchievementSortOrder
											gamesWithAchievements={gamesWithAchievements}
											setGamesWithAchievements={setGamesWithAchievements}
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
					{gamesWithoutAchievements.flatMap((game) =>
						<div key={game.appid}>
							{displayTitleInfo(game)}
							<h3>No Achievements</h3>
						</div>
					)}
				</>
			)}
		</>
	)
}