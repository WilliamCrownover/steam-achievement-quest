

export const getUserGames = async () => {
	let url = 'http://localhost:5000/getData'

	try {
		let res = await fetch(url);
		return await res.json();
	} catch (error) {
		console.log(error);
	}
}