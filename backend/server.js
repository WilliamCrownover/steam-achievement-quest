import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const PORT = 5000;
const app = express();

app.use(cors());
const corsOptions = {
	origin: "http://localhost:3000"
};

app.get('/getData/:userId', cors(corsOptions), async (req, res) => {
	const endpoint = `
		https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&steamid=${req.params.userId}
		&format=json
		&include_appinfo=true
		&include_played_free_games=true
	`;
	const fetchOptions = {
		method: 'GET'
	}

	try {
		const response = await fetch(endpoint, fetchOptions);
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(error);
		return { error: 'Could not fetch. Check User ID value.', success: false };
	}
});

app.get('/getGameAchievements/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
		https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/
		?gameid=${req.params.appId}
	`;
	const fetchOptions = {
		method: 'GET'
	}
	const response = await fetch(endpoint, fetchOptions);
	const jsonResponse = await response.json();
	res.json(jsonResponse);
});

app.get('/getUserAchievements/:appId/:userId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/
		?appid=${req.params.appId}
		&key=${process.env.REACT_APP_STEAM_KEY}
		&steamid=${req.params.userId}
	`;
	const fetchOptions = {
		method: 'GET'
	}
	const response = await fetch(endpoint, fetchOptions);
	const jsonResponse = await response.json();
	res.json(jsonResponse);
});

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});