import { useState } from "react";
import { dateFormat, getUserGames, getUserInfo } from '../utils/api'

export const SteamUser = () => {
	const [userId, setUserId] = useState('76561198035409755');
	const [userIdCheck, setUserIdCheck] = useState(true);
	const userIdRegex = new RegExp('^(7656[0-9]{13}?)$');
	const [userData, setUserData] = useState({});
	const [loadingUserData, setLoadingUserData] = useState(true);
	const [loading, setLoading] = useState(false);
	const [noDataResponse, setNoDataResponse] = useState(false);
	const [gameWithAchievements, setGameWithAchievements] = useState([]);
	const [gameWithoutAchievements, setGameWithoutAchievements] = useState([]);

	const handleChange = (e) => {
		setNoDataResponse(false);
		const value = e.target.value;
		setUserId(e.target.value);
		userIdRegex.test(value) ? setUserIdCheck(true) : setUserIdCheck(false);
	}

	const handleSubmit = (e) => {
		const inputValue = e.target[0].value;
		const getData = async () => {
			setLoading(true);
			setNoDataResponse(false);
			setGameWithAchievements([]);
			setGameWithoutAchievements([]);
			const allData = await getUserGames(inputValue);
			if(allData === undefined) {
				setLoading(false);
				setNoDataResponse(true);
				return;
			}
			const gamesWithAchievementsData = allData.filter(game => game.achievements !== undefined);
			const gamesWithoutAchievementsData = allData.filter(game => game.achievements === undefined);
			gamesWithAchievementsData.sort((a,b) => a.name.localeCompare(b.name));
			gamesWithoutAchievementsData.sort((a, b) => a.name.localeCompare(b.name));
			setGameWithAchievements(gamesWithAchievementsData);
			setGameWithoutAchievements(gamesWithoutAchievementsData);
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
				<h2>Total Number of Games: {gameWithAchievements.length + gameWithoutAchievements.length}</h2>
				<h3>Total With Achievements: {gameWithAchievements.length}</h3>
				<h3>Total Without Achievements: {gameWithoutAchievements.length}</h3>
				<h3>Number of Achievements: {gameWithAchievements.reduce((total, current) => total + current.totalAchievements, 0)}</h3>
				<h3>Number of Achievements Completed: {gameWithAchievements.reduce((total, current) => total + current.totalCompletedAchievements, 0)}</h3>
		</>
	}

	const changeGameSort = (e) => {
		const value = e.target.value;
		switch (true) {
			case value === 'Name':
				setGameWithAchievements([...gameWithAchievements].sort((a,b) => a.name.localeCompare(b.name)));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => a.name.localeCompare(b.name)));
				break;
			case value === 'Playtime':
				setGameWithAchievements([...gameWithAchievements].sort((a,b) => b.hoursPlayed - a.hoursPlayed));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => b.hoursPlayed - a.hoursPlayed));
				break;
			case value === 'LastPlayed':
				setGameWithAchievements([...gameWithAchievements].sort((a,b) => b.rtime_last_played - a.rtime_last_played));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => b.rtime_last_played - a.rtime_last_played));
				break;
			case value === 'TotalAchievements':
				setGameWithAchievements([...gameWithAchievements].sort((a, b) => a.totalAchievements - b.totalAchievements));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => a.name.localeCompare(b.name)));
				break;
			case value === 'PercentComplete':
				setGameWithAchievements([...gameWithAchievements].sort((a, b) => a.totalAchievements - b.totalAchievements).sort((a, b) => b.percentComplete - a.percentComplete));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => a.name.localeCompare(b.name)));
				break;
			case value === 'GlobalAverage':
				setGameWithAchievements([...gameWithAchievements].sort((a, b) => b.averagePercent - a.averagePercent));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => a.name.localeCompare(b.name)));
				break;
			case value === 'LastAchievement':
				setGameWithAchievements([...gameWithAchievements].sort((a, b) => b.achievements[b.achievements.length - 1].percent - a.achievements[a.achievements.length - 1].percent));
				setGameWithoutAchievements([...gameWithoutAchievements].sort((a,b) => a.name.localeCompare(b.name)));
				break;
			default:
				return;
		}
	}

	const changeAchievementSort = (e) => {
		const value = e.target.value;
		switch (true) {
			case value === 'Percent':
				const pSort = gameWithAchievements.map(
					(game) => (
						{ 
							...game, 
							achievements: game.achievements.sort(
								(a, b) => b.percent - a.percent
							)
						}
					)
				);
				setGameWithAchievements(pSort);
				break;
			case value === 'Name':
				const nSort = gameWithAchievements.map(
					(game) => (
						{ 
							...game, 
							achievements: game.achievements.sort(
								(a, b) => a.name.localeCompare(b.name)
							)
						}
					)
				);
				setGameWithAchievements(nSort);
				break;
			case value === 'UnlockDate':
				const udSort = gameWithAchievements.map(
					(game) => (
						{ 
							...game, 
							achievements: game.achievements.sort(
								(a, b) => b.percent - a.percent
							).sort(
								(a, b) => (a.unlocktime === 0 ? 9999999999 : a.unlocktime) - (b.unlocktime === 0 ? 9999999999 : b.unlocktime)
							)
						}
					)
				);
				setGameWithAchievements(udSort);
				break;
			default:
				return;
		}
	}

	const displayGameSortOptions = () => {
		return (
			<>
				<h4>Game Sort Order</h4>
				<div onChange={changeGameSort}>
					<input type='radio' value='Name' name='sortGames' defaultChecked/> Alphabetical Order
					<input type='radio' value='Playtime' name='sortGames'/> Playtime
					<input type='radio' value='LastPlayed' name='sortGames'/> Last Played Date
					<input type='radio' value='TotalAchievements' name='sortGames'/> Total Number of Achievements
					<input type='radio' value='PercentComplete' name='sortGames'/> Percent Complete
					<input type='radio' value='GlobalAverage' name='sortGames'/> Average Global Achievement Rate
					<input type='radio' value='LastAchievement' name='sortGames'/> Difficulty of Last Achievement
				</div>
			</>
		)
	}

	const displayAchievementsSortOptions = () => {
		return (
			<>
				<h4>Achievement Sort Order</h4>
				<div onChange={changeAchievementSort}>
					<input type='radio' value='Percent' name='sortAchievements' defaultChecked/> Global Percent Complete
					<input type='radio' value='Name' name='sortAchievements'/> Alphabetical Name
					<input type='radio' value='UnlockDate' name='sortAchievements'/> Date Achieved
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
					const percent = achievement.percent.toFixed(2);
					const colorFill = setColorFill(percent);
					return (
						<div style={{ width: `${1 / achievementList.length * 100}%`, height: `${achievement.percent*2}px`, backgroundColor: `${achievement.achieved ? 'lightGrey' : colorFill}` }} />
					)
				})}
			</div>
		)
	}

	const displayAchievements = (achievementList) => {
		return (
			<div className='achievementList'>
				{achievementList.map((achievement) => {
					const name = achievement.name;
					const percent = achievement.percent.toFixed(2);
					const colorFill = setColorFill(percent);
					const achieved = achievement.achieved && 'achieved'
					return <h3 key={name} title={`${name} - ${achievement.unlockDate}`} style={{ backgroundColor: colorFill }} className={achieved}>{percent}</h3>
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
			{noDataResponse && <p>This Steam user has a completely private profile.</p>}
			{gameWithAchievements[0]?.privateProfile && <p>This Steam user's achievements completed data is private.</p>}
			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
					{!loadingUserData && 
						<>
							{displayUserInfo()}
							{displayGameSortOptions()}
							{displayAchievementsSortOptions()}
						</>
					}
					{gameWithAchievements.flatMap((game) => {
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
					{gameWithoutAchievements.flatMap((game) =>
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