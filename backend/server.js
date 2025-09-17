import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const PORT = 5000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());
const corsOptions = {
	origin: 'http://localhost:3000',
};

const DATA_DIR = path.join(process.cwd(), 'data');
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

app.post('/saveData/:key', cors(corsOptions), async (req, res) => {
	try {
		const { key } = req.params;
		const data = req.body;
		const filePath = path.join(DATA_DIR, `${key}.json`);
		await fs.writeFile(filePath, JSON.stringify(data, null, 2));
		res.json({ success: true });
	} catch (error) {
		console.error('Error saving data:', error);
		res.status(500).json({ error: error.message });
	}
});

app.get('/loadData/:key', cors(corsOptions), async (req, res) => {
	try {
		const { key } = req.params;
		const filePath = path.join(DATA_DIR, `${key}.json`);
		const data = await fs.readFile(filePath, 'utf8');
		res.json(JSON.parse(data));
	} catch (error) {
		if (error.code === 'ENOENT') {
			res.status(404).json({ error: 'Data not found' });
		} else {
			console.error('Error loading data:', error);
			res.status(500).json({ error: error.message });
		}
	}
});

app.get('/checkForDataFile/:key', cors(corsOptions), async (req, res) => {
	try {
		const { key } = req.params;
		const filePath = path.join(DATA_DIR, `${key}.json`);
		await fs.access(filePath);
		res.json({ exists: true });
	} catch (error) {
		res.json({ exists: false });
	}
});

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
		method: 'GET',
	};

	try {
		const response = await fetch(endpoint, fetchOptions);
		if (response.status !== 200) {
			throw new Error('Could not fetch owned games. Check User ID value.');
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
		method: 'GET',
	};

	try {
		const response = await fetch(endpoint, fetchOptions);
		if (response.status !== 200) {
			throw new Error('Could not fetch user info. Check User ID value.');
		}
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
		method: 'GET',
		timeout: 10000,
	};
	try {
		const response = await fetch(endpoint, fetchOptions);
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(`Error fetching game achievements for app ${req.params.appId}:`, error.message);
		res.status(503).json({
			error: 'Could not fetch game achievements',
			success: false,
			message: error.message || 'Connection timed out',
			code: error.code || 'UNKNOWN_ERROR',
			retryable: true,
		});
	}
});

app.get('/getSchemaForGame/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&appid=${req.params.appId}
	`;
	const fetchOptions = {
		method: 'GET',
		timeout: 10000,
	};
	try {
		const response = await fetch(endpoint, fetchOptions);
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(`Error fetching schema for app ${req.params.appId}:`, error.message);
		res.status(503).json({
			error: 'Could not fetch game schema',
			success: false,
			message: error.message || 'Connection timed out',
			code: error.code || 'UNKNOWN_ERROR',
			retryable: true,
		});
	}
});

app.get('/getCurrentPlayersForGame/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/
		?key=${process.env.REACT_APP_STEAM_KEY}
		&appid=${req.params.appId}
	`;
	const fetchOptions = {
		method: 'GET',
		timeout: 10000,
	};
	try {
		const response = await fetch(endpoint, fetchOptions);
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(`Error fetching current players for app ${req.params.appId}:`, error.message);
		res.status(503).json({
			error: 'Could not fetch current players',
			success: false,
			message: error.message || 'Connection timed out',
			code: error.code || 'UNKNOWN_ERROR',
			retryable: true,
		});
	}
});

app.get('/getReviewsForGame/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://store.steampowered.com/appreviews/
		${req.params.appId}
		?num_per_page=0&json=1
	`;
	const fetchOptions = {
		method: 'GET',
		timeout: 10000,
	};
	try {
		const response = await fetch(endpoint, fetchOptions);
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(`Error fetching reviews for app ${req.params.appId}:`, error.message);
		res.status(503).json({
			error: 'Could not fetch app reviews',
			success: false,
			message: error.message || 'Connection timed out',
			code: error.code || 'UNKNOWN_ERROR',
			retryable: true,
		});
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
		method: 'GET',
		timeout: 10000,
	};
	try {
		const response = await fetch(endpoint, fetchOptions);
		const jsonResponse = await response.json();
		res.json(jsonResponse);
	} catch (error) {
		console.log(
			`Error fetching user achievements for app ${req.params.appId} and user ${req.params.userId}:`,
			error.message
		);
		res.status(503).json({
			error: 'Could not fetch user achievements',
			success: false,
			message: error.message || 'Connection timed out',
			code: error.code || 'UNKNOWN_ERROR',
			retryable: true,
		});
	}
});

app.get('/getSteamSpyAppDetails/:appId', cors(corsOptions), async (req, res) => {
	const endpoint = `
	https://steamspy.com/api.php
		?request=appdetails
		&appid=${req.params.appId}
	`;
	const fetchOptions = {
		method: 'GET',
	};
	try {
		const response = await fetch(endpoint, fetchOptions);
		const textResponse = await response.text();
		try {
			const jsonResponse = JSON.parse(textResponse);
			res.json(jsonResponse);
		} catch (jsonError) {
			res.json({ message: textResponse });
		}
	} catch (error) {
		console.log(error);
		return { error: 'Could not fetch steamspy app details.', success: false };
	}
});

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});
