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

	const displayAchievements = (achievementList) => {
		if(achievementList === undefined) { return <h3>No Achievements</h3>}
		if ( achievementList.length > 0) {
			return (
				<div className='achievementList'>
					{achievementList.map((achievement) => {
						const percent = achievement.percent.toFixed(2)
						const colorFill = percent >= 90 ? 'overNinety' : percent >= 50 ? 'overFifty' : percent >= 10 ? 'overTen' : percent >= 1 ? 'overOne' : 'underOne';
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