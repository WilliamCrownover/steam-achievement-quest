import { useEffect, useState } from "react";
import { getUserGames } from '../utils/api'

export const SteamUser = () => {
	const [ userData, setUserData ] = useState([]);

	useEffect(() => {
		const getData = async () => {
			setUserData( await getUserGames());
		};

		getData();
	}, [])

	useEffect(() => {
		console.log('Show me the data', userData)
	}, [userData])

	const dataFormat = (timestamp) => {
		if(timestamp <= 100000) return 'Not Played';
		const dateObject = new Date(timestamp*1000);
		return dateObject.toLocaleString('en-US', {

		})
	}
	
	return (
		<>
		{userData.response?.games?.map((game) => (
			<div key={game.name}>
				<h2 key={game.name}>{game.name}</h2>
				{game.playtime_forever > 0 && <p key={`${game.name}_pt`}>{`${parseFloat(game.playtime_forever/60).toFixed(2)} Hours Played`}</p>}
				<p key={`${game.name}_lp`}>{dataFormat(game.rtime_last_played)}</p>
			</div>
		))}
		</>
	)
}