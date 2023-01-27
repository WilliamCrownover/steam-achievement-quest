import { useState } from "react";
import { getUserGameData, getUserInfo } from '../utils/api'
import { round, sortAlphabeticalThenSetState } from '../utils/utils';
import { UserInfoSection } from './UserInfoSection';
import { GamesInfoSection } from './GamesInfoSection';
import { GameSortOrder } from './GameSortOrder';
import { AchievementSortOrder } from './AchievementSortOrder';


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

	const setColorFill = (number) => {
		const percent = parseInt(number) / 100;
		const redIncrease = 255 * (1 - percent)
		const greenIncrease = 100 + 155 * (1 - percent)
		const greenDecrease = 100 + 155 * (percent)
		const greenDecreaseMax = greenIncrease * (percent * 10)
		switch (true) {
			case number >= 90:
				return 'rgb(0,255,0)';
			case number >= 50:
				return `rgb(${redIncrease},${greenDecrease},0)`;
			case number >= 10:
				return `rgb(${redIncrease},${greenIncrease},0)`;
			case number >= 1:
				return `rgb(${redIncrease},${greenDecreaseMax},0)`;
			case number >= 0.11:
				return 'rgb(200,0,0)'
			default:
				return 'rgb(150,0,0)'
		}
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

	const displayGraph = (achievementList) => {
		return (
			<div className='completeGraph'>
				{achievementList.map((achievement) => {
					const percent = round(achievement.percent);
					const colorFill = setColorFill(percent);
					return (
						<div key={achievement.name} title={achievement.hoverInfo} style={{ width: `${1 / achievementList.length * 100}%`, height: `${achievement.percent * 2}px`, backgroundColor: `${achievement.achieved ? 'lightGrey' : colorFill}` }} />
					)
				})}
			</div>
		)
	}

	const displayAchievements = (achievementList) => {
		return (
			<div className='achievementList'>
				{achievementList.map((achievement) => {
					const percent = round(achievement.percent);
					const colorFill = setColorFill(percent);
					const achieved = achievement.achieved && 'achieved'
					return <h3 key={achievement.name} title={achievement.hoverInfo} style={{ backgroundColor: colorFill }} className={achieved}>{percent}</h3>
				})}
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
					{gamesWithAchievements.flatMap((game) => {
						const distribution = game.achievementDifficultyDistribution;
						return (
							<div key={game.appid}>
								{displayGraph(game.achievements)}
								{distribution?.easyPercent !== undefined &&
									<div className='difficultyBar'>
										<div className='segment easy' style={{ width: `${distribution.easyPercent}%` }} />
										<div className='segment medium' style={{ width: `${distribution.mediumPercent}%` }} />
										<div className='segment hard' style={{ width: `${distribution.hardPercent}%` }} />
										<div className='segment impossible' style={{ width: `${distribution.impossiblePercent}%` }} />
									</div>
								}
								<h3
									className={`${game.percentComplete === '100.00' && 'achieved'}`}
									style={{ backgroundColor: setColorFill(game.averagePercent), margin: '3px 0px' }}
								>
									{game.averagePercent}
								</h3>
								{displayAchievements(game.achievements)}
								{displayTitleInfo(game)}
								<h3>{game.totalAchievements} Total Achievements</h3>
								<h3 className='bottomItem'>{game.totalCompletedAchievements} Completed - {game.percentComplete}%</h3>
							</div>
						)
					})}
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