import { useState } from "react";
import { getUserGameData, getUserInfo } from '../utils/api'
import { dateFormat, round, sorter, sortAlphabet, sortNumber } from '../utils/utils';
import { AchievementSortOrder } from './AchievementSortOrder';


export const SteamUser = () => {
	const [sampleSize, setSampleSize]= useState(true);
	const [userId, setUserId] = useState('76561198035409755');
	const [userIdCheck, setUserIdCheck] = useState(true);
	const userIdRegex = new RegExp('^(7656[0-9]{13}?)$');
	const [userData, setUserData] = useState({});
	const [loadingUserData, setLoadingUserData] = useState(true);
	const [loading, setLoading] = useState(false);
	const [noDataResponse, setNoDataResponse] = useState(false);
	const [gamesWithAchievements, setGamesWithAchievements] = useState([]);
	const [gamesWithoutAchievements, setGamesWithoutAchievements] = useState([]);

	const handleChange = (e) => {
		setNoDataResponse(false);
		const value = e.target.value;
		setUserId(e.target.value);
		userIdRegex.test(value) ? setUserIdCheck(true) : setUserIdCheck(false);
	}

	const sortAlphabeticalThenSetState = (setFunction, array, property) => setFunction(sorter(array, sortAlphabet(property)));
	const sortNumberThenSetState = (setFunction, array, property, descending = false) => setFunction(sorter(array, sortNumber(property, descending)));

	const handleSubmit = (e) => {
		const inputValue = e.target[0].value;
		const getData = async () => {
			setLoading(true);
			setNoDataResponse(false);
			setGamesWithAchievements([]);
			setGamesWithoutAchievements([]);
			const allData = await getUserGameData(inputValue, sampleSize);
			console.log(allData);
			if(allData === undefined) {
				setLoading(false);
				setNoDataResponse(true);
				return;
			}
			const gamesWithAchievementsData = allData.filter(game => game.achievements !== undefined);
			const gamesWithoutAchievementsData = allData.filter(game => game.achievements === undefined);
			sortAlphabeticalThenSetState(setGamesWithAchievements, gamesWithAchievementsData, 'name');
			sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievementsData, 'name');
			setLoading(false);
		};

		const getUserData = async () => {
			setUserData({});
			setLoadingUserData(true);
			const uData = await getUserInfo(inputValue);
			setUserData(uData);
			setLoadingUserData(false);
			if(uData === undefined) {
				setLoading(false);
			}
		}

		getData();
		getUserData();
		e.preventDefault();
	}

	const displayUserInfo = () => {
		return userData === undefined 
		? <p>Steam User Profile does not exist.</p> 
		: <>
				<h2>Username: {userData.personaname} {userData.realname && `(${userData.realname})`}</h2>
				<h3>Profile Link: <span><a href={userData.profileurl} target='_blank' rel='noreferrer'>{userData.profileurl}</a></span></h3>
				{userData.lastlogoff && <h3>Last Online: {dateFormat(userData.lastlogoff)}</h3>}
				{userData.timecreated && <h3>Profile Created: {dateFormat(userData.timecreated)}</h3>}
				<h2>Total Number of Games: {gamesWithAchievements.length + gamesWithoutAchievements.length}</h2>
				<h3>Total With Achievements: {gamesWithAchievements.length}</h3>
				<h3>Total Without Achievements: {gamesWithoutAchievements.length}</h3>
				<h3>Number of Achievements: {gamesWithAchievements.reduce((total, current) => total + current.totalAchievements, 0)}</h3>
				<h3>Number of Achievements Completed: {gamesWithAchievements.reduce((total, current) => total + current.totalCompletedAchievements, 0)}</h3>
		</>
	}

	const changeGameOrder = (e) => {
		const value = e.target.value;
		sortAlphabeticalThenSetState(setGamesWithoutAchievements, gamesWithoutAchievements, 'name');
		const sharedSort = (property) => {
			sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], property, true);
			sortNumberThenSetState(setGamesWithoutAchievements, [...gamesWithoutAchievements], property, true);
		}
		switch (true) {
			case value === 'name':
				sortAlphabeticalThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value);
				break;
			case value === 'hoursPlayed':
				sharedSort(value);
				break;
			case value === 'rtime_last_played':
				sharedSort(value);
				break;
			case value === 'totalAchievements':
				sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value);
				break;
			case value === 'percentComplete':
				sortNumberThenSetState(setGamesWithAchievements, [...sorter([...gamesWithAchievements], sortNumber('totalAchievements'))], value, true);
				break;
			case value === 'averagePercent':
				sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value, true);
				break;
			case value === 'lowestAchievementPercent':
				sortNumberThenSetState(setGamesWithAchievements, [...gamesWithAchievements], value, true);
				break;
			default:
				return;
		}
	}

	const displayGameSortOptions = () => {
		return (
			<>
				<h4>Game Sort Order</h4>
				<div onChange={changeGameOrder}>
					<input type='radio' value='name' name='sortGames' defaultChecked/> Alphabetical
					<input type='radio' value='hoursPlayed' name='sortGames'/> Playtime
					<input type='radio' value='rtime_last_played' name='sortGames'/> Last Played Date
					<input type='radio' value='totalAchievements' name='sortGames'/> Number of Achievements
					<input type='radio' value='percentComplete' name='sortGames'/> Percent Complete
					<input type='radio' value='averagePercent' name='sortGames'/> Average Global Achievement Rate
					<input type='radio' value='lowestAchievementPercent' name='sortGames'/> Lowest Achievement Percent per Game
				</div>
			</>
		)
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
						<div key={achievement.name} title={achievement.hoverInfo} style={{ width: `${1 / achievementList.length * 100}%`, height: `${achievement.percent*2}px`, backgroundColor: `${achievement.achieved ? 'lightGrey' : colorFill}` }} />
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
					<input type='text' value={userId} onChange={handleChange}/>
				</label>
				<input type='submit' value='Submit' disabled={!userIdCheck}/>
				{!userIdCheck && <p>Not a valid User ID</p>}
			</form>
			<label>
				<input type='checkbox' checked={sampleSize} onChange={() => setSampleSize(!sampleSize)}/>
				Use Test Data Size: 25 Games
			</label>
			{(noDataResponse && userData) && <p>This Steam user has a completely private profile.</p>}
			{gamesWithAchievements[0]?.privateProfile && <p>This Steam user's achievements completed data is private.</p>}
			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
					{!loadingUserData && 
						<>
							{displayUserInfo()}
							{displayGameSortOptions()}
							<AchievementSortOrder gamesWithAchievements={gamesWithAchievements} setGamesWithAchievements={setGamesWithAchievements}/>
						</>
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