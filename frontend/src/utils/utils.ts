export const dateFormat = (timestamp) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', {dateStyle:'medium'});
}

export const percent = (num, total) => `${round(num / total * 100)}%`;

export const round = (num: number) => num.toFixed(2);

export const setColorFill = (number, achieved = false) => {
	let redAchieved = 255;
	let greenAchieved = 155;
	let greenAchievedEasy = 255;
	let blueAchieved = 0;
	let opacity = 1;
	if (achieved) {
		redAchieved = 255 / 2;
		greenAchieved = 155 / 2;
		greenAchievedEasy = 170;
		blueAchieved = 255;
		opacity = 0.5;
	}
	const percent = parseInt(number) / 100;
	const redIncrease = redAchieved * (1 - percent);
	const greenIncrease = 100 + greenAchieved * (1 - percent);
	const greenDecrease = 100 + greenAchieved * (percent);
	const greenDecreaseMax = greenIncrease * (percent * 10);
	switch (true) {
		case number >= 90:
			return `rgba(0,${greenAchievedEasy},${blueAchieved},${opacity})`;
		case number >= 50:
			return `rgba(${redIncrease},${greenDecrease},${blueAchieved},${opacity})`;
		case number >= 10:
			return `rgba(${redIncrease},${greenIncrease},${blueAchieved},${opacity})`;
		case number >= 1:
			return `rgba(${redIncrease},${greenDecreaseMax},${blueAchieved},${opacity})`;
		case number >= 0.11:
			return `rgba(200,0,${blueAchieved},${opacity})`
		default:
			return `rgba(150,0,${blueAchieved},${opacity})`
	}
}

export const sorter = (array, method) => 
	array.sort(method);

export const sortAlphabet = (property) => 
	(a, b) => a[property].localeCompare(b[property]);

export const sortNumber = (property, descending = false) => 
	(a, b) => (descending ? b[property] : a[property]) - (descending ? a[property] : b[property]);

export const sortAlphabeticalThenSetState = (setFunction, array, property) => 
	setFunction(sorter(array, sortAlphabet(property)));

export const sortNumberThenSetState = (setFunction, array, property, descending = false) => 
	setFunction(sorter(array, sortNumber(property, descending)));