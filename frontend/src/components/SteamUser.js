import { useState } from "react";
import { getUserGames } from '../utils/api'

export const SteamUser = () => {
	const [userId, setUserId] = useState('76561198035409755');
	const [userIdCheck, setUserIdCheck] = useState(true);
	const userIdRegex = new RegExp('^(7656[0-9]{13}?)$');
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
		const getData = async () => {
			setLoading(true);
			setNoDataResponse(false);
			setGameWithAchievements([]);
			setGameWithoutAchievements([]);
			const allData = await getUserGames(e.target[0].value);
			console.log(allData);
			if(allData === undefined) {
				setLoading(false);
				setNoDataResponse(true);
				return;
			}
			const gamesWithAchievementsData = allData.filter(game => game.achievements !== undefined);
			const gamesWithoutAchievementsData = allData.filter(game => game.achievements === undefined);
			// const sorted = data.sort((a,b) => a.name.localeCompare(b.name)).sort((a,b) => b.playtime_forever-a.playtime_forever);
			// gamesWithAchievementsData.sort((a, b) => b.achievements[b.achievements.length - 1].percent - a.achievements[a.achievements.length - 1].percent).sort((a, b) => a.achievements.length - b.achievements.length);
			gamesWithAchievementsData.sort((a, b) => b.achievements[b.achievements.length - 1].percent - a.achievements[a.achievements.length - 1].percent);
			// gamesWithAchievementsData
			// 	.sort((a, b) => b.achievementDifficultyDistribution.impossiblePercent - a.achievementDifficultyDistribution.impossiblePercent)
			// 	.sort((a, b) => b.achievementDifficultyDistribution.hardPercent - a.achievementDifficultyDistribution.hardPercent)
			// 	.sort((a, b) => b.achievementDifficultyDistribution.mediumPercent - a.achievementDifficultyDistribution.mediumPercent)
			// 	.sort((a, b) => b.achievementDifficultyDistribution.easyPercent - a.achievementDifficultyDistribution.easyPercent);
			gamesWithoutAchievementsData.sort((a, b) => a.name.localeCompare(b.name));
			setGameWithAchievements(gamesWithAchievementsData);
			setGameWithoutAchievements(gamesWithoutAchievementsData);
			setLoading(false);
		};

		getData();
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
					return <h3 key={name} title={name} style={{ backgroundColor: colorFill }} className={achieved}>{percent}</h3>
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
			{noDataResponse && <p>A Steam User with this ID does not exist or has a completely private profile.</p>}
			{gameWithAchievements[0]?.privateProfile && <p>This Steam user's achievements completed data is private.</p>}
			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
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