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
		switch (true) {
			case number >= 90:
				return 'overNinety';
			case number >= 50:
				return 'overFifty';
			case number >= 10:
				return 'overTen';
			case number >= 1:
				return 'overOne';
			default:
				return 'underOne'
		}
	}

	const displayAchievements = (achievementList) => {
		if(achievementList === undefined) { return <h3>No Achievements</h3>}
		if ( achievementList.length > 0) {
			const averagePercent = averageAchievementPercent(achievementList).toFixed(2);
			return (
				<div className='achievementList'>
					<h3 className={setColorFill(averagePercent) + ' averagePercent'}>{averagePercent}</h3>
					{achievementList.map((achievement) => {
						const percent = achievement.percent.toFixed(2)
						const colorFill = setColorFill(percent);
						return <h3 title={achievement.name} className={colorFill}>{percent}</h3>
					})}
				</div>
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