import { useEffect, useState } from "react";
import { getUserGames } from '../utils/api'

export const SteamUser = () => {
	const [ userData, setUserData ] = useState();

	useEffect(() => {
		const getData = async () => {
			setUserData( await getUserGames());
		};

		getData();
	}, [])

	useEffect(() => {
		console.log('Show me the data', userData)
	}, [userData])
	
	return (
		<h1>Test</h1>
	)
}