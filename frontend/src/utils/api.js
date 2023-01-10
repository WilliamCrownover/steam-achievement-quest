

export const getUserGames = async () => {
	let url = `
		https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&steamid=${process.env.REACT_APP_USER_ID}
		&format=json
		&include_appinfo=true
	`

	try {
		let res = await fetch(url);
		return await res.json();
	} catch (error) {
		console.log(error);
	}
}