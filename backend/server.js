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

app.get('/getOwnedGames/:userId', cors(corsOptions), async (req, res) => {
	const endpoint = `
		https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&steamid=${req.params.userId}
		&format=json
		&include_appinfo=true
		&include_extended_appinfo=true
		&include_played_free_games=true
		&skip_unvetted_apps=false
	`;
	const fetchOptions = {
		method: 'GET'
	}

	try {
		const response = await fetch(endpoint, fetchOptions);
		if (response.status !== 200) {
			throw new Error('Could not fetch. Check User ID value.');
		}
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(error);
		return { error, success: false };
	}
});

app.get('/getUserInfo/:userId', cors(corsOptions), async (req, res) => {
	const endpoint = `
		https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&steamids=${req.params.userId}
		&format=json
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

app.get('/getSchemaForGame/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&appid=${req.params.appId}
	`;
	const fetchOptions = {
		method: 'GET'
	}
	const response = await fetch(endpoint, fetchOptions);
	const jsonResponse = await response.json();
	res.json(jsonResponse);
});

app.get('/getCurrentPlayersForGame/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&appid=${req.params.appId}
	`;
	const fetchOptions = {
		method: 'GET'
	}
	const response = await fetch(endpoint, fetchOptions);
	const jsonResponse = await response.json();
	res.json(jsonResponse);
});

app.get('/getReviewsForGame/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://store.steampowered.com/appreviews/
		${req.params.appId}
		?num_per_page=0&json=1
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
		return { error: 'Could not fetch app reviews.', success: false };
	}

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