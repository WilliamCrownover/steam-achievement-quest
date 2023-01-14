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

const requestEndpoint = `
	https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/
	?key=${process.env.REACT_APP_STEAM_KEY}
	&steamid=${process.env.REACT_APP_USER_ID}
	&format=json
	&include_appinfo=true
	&include_played_free_games=true
`;

app.get('/getData', cors(corsOptions), async (req, res) => {
	const fetchOptions = {
		method: 'GET'
	}
	const response = await fetch(requestEndpoint, fetchOptions);
	const jsonResponse = await response.json();
	res.json(jsonResponse);
});

app.get('/getGameAchievements/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${req.params.appId}`
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