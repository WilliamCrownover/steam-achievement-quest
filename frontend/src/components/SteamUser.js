import { useEffect, useState } from "react";
import { getUserGames } from '../utils/api'

export const SteamUser = () => {
	const [loading, setLoading] = useState(true);
	const [gameWithAchievements, setGameWithAchievements] = useState([]);
	const [gameWithoutAchievements, setGameWithoutAchievements] = useState([]);

	useEffect(() => {
		const getData = async () => {
			setLoading(true);
			const allData = await getUserGames('76561198035409755');
			const gamesWithAchievementsData = allData.filter(game => game.achievements !== undefined);
			const gamesWithoutAchievementsData = allData.filter(game => game.achievements === undefined);
			// const sorted = data.sort((a,b) => a.name.localeCompare(b.name)).sort((a,b) => b.playtime_forever-a.playtime_forever);
			gamesWithAchievementsData.sort((a, b) => b.achievements[b.achievements.length - 1].percent - a.achievements[a.achievements.length - 1].percent).sort((a, b) => a.achievements.length - b.achievements.length);
			gamesWithoutAchievementsData.sort((a, b) => a.name.localeCompare(b.name));
			setGameWithAchievements(gamesWithAchievementsData);
			setGameWithoutAchievements(gamesWithoutAchievementsData);
			setLoading(false);
		};

		getData();
	}, [])

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

	const displayAchievements = (achievementList) => {
			return (
				<>
					<div className='achievementList'>
						{achievementList.map((achievement) => {
							const name = achievement.name;
							const percent = achievement.percent.toFixed(2);
							const colorFill = setColorFill(percent);
							const achieved = achievement.achieved && 'achieved'
							return <h3 key={name} title={name} style={{ backgroundColor: colorFill }} className={achieved}>{percent}</h3>
						})}
					</div>
				</>
			)
	}

	return (
		<>
			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
					{gameWithAchievements.flatMap((game) =>
						<div key={game.appid}>
							{displayTitleInfo(game)}
							<h3>{game.totalAchievements} Total Achievements</h3>
							<h3>{game.totalCompletedAchievements} Completed - {game.percentComplete}%</h3>
							<h3
								className={`averagePercent ${game.percentComplete === '100.00' && 'achieved'}`}
								style={{ backgroundColor: setColorFill(game.averagePercent) }}
							>
								{game.averagePercent}
							</h3>
							{displayAchievements(game.achievements)}
						</div>
					)}
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