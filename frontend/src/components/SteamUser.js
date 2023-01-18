import { useEffect, useState } from "react";
import { getUserGames } from '../utils/api'

export const SteamUser = () => {
	const [loading, setLoading] = useState(true);
	const [userData, setUserData] = useState([]);

	useEffect(() => {
		const getData = async () => {
			setLoading(true);
			const data = await getUserGames()
			const sorted = data.sort((a,b) => a.name.localeCompare(b.name));
			setUserData(sorted);
			setLoading(false);
		};

		getData();
	}, [])

	const dataFormat = (timestamp) => {
		if (timestamp <= 100000) return 'Not Played';
		const dateObject = new Date(timestamp * 1000);
		return dateObject.toLocaleString('en-US', {
		})
	}

	const averageAchievementPercent = (list) => {
		const sum = (prev, cur) => ({percent: prev.percent + cur.percent});
		const avg = list.reduce(sum).percent/list.length;
		return avg;
	}

	const setColorFill = (number) => {
		const percent = parseInt(number)/100;
		const redIncrease = 255*(1-percent)
		const greenIncrease = 100+155*(1-percent)
		const greenDecrease = 100+155*(percent)
		const greenDecreaseMax = greenIncrease*(percent*10)
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

	const totalComplete = (achievementList) => {
		let total = 0;
		achievementList.forEach((achievement) => {
			if(achievement.achieved) total += 1;
		})
		return total;
	}

	const displayAchievements = (achievementList) => {
		if(achievementList === undefined) { return <h3>No Achievements</h3>}
		if ( achievementList.length > 0) {
			const averagePercent = averageAchievementPercent(achievementList).toFixed(2);
			const totalAchievements = achievementList.length;
			const completedTotal = totalComplete(achievementList);
			const percentComplete = ((completedTotal/totalAchievements)*100).toFixed(2);
			return (
				<>
					<h3>{totalAchievements} Total Achievements</h3>
					<h3>{completedTotal} Completed - {percentComplete}%</h3>
					<h3 
						className={`averagePercent ${percentComplete === '100.00' && 'achieved'}`}
						style={{backgroundColor: setColorFill(averagePercent)}}
					>
						{averagePercent}
					</h3>
					<div className='achievementList'>
						{achievementList.map((achievement) => {
							const name = achievement.name;
							const percent = achievement.percent.toFixed(2);
							const colorFill = setColorFill(percent);
							const achieved = achievement.achieved && 'achieved'
							return <h3 key={name} title={name} style={{backgroundColor: colorFill}} className={achieved}>{percent}</h3>
						})}
					</div>
				</>
			)
		} else { return <h3>No Achievements</h3> }
	}

	return (
		<>
			{loading ? (
				<h1>Loading!</h1>
			) : (
				<>
					{userData.map((game) => (
						<div key={game.name}>
							<div className='gameTitleInfo'>
								<h2>{game.name}</h2>
								{game.playtime_forever > 0 && <p>{`${parseFloat(game.playtime_forever / 60).toFixed(2)} Hours Played`}</p>}
								<p>{dataFormat(game.rtime_last_played)}</p>
							</div>
							{displayAchievements(game.achievements)}
						</div>
					))}
				</>
			)}
		</>
	)
}