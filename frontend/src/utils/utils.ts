export const dateFormat = (timestamp: number) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', {dateStyle:'medium'});
}

export const percent = (num: number, total: number) => `${round(num / total * 100)}%`;

export const round = (num: number) => Number(num.toFixed(2));

export const setColorFill = (number: number, achieved = false) => {
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
	const percent = number / 100;
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

export const sorter = <T>(array: T[], method: (a: T, b: T) => number) => 
	array.sort(method);

export const sortAlphabet = <T>(property: keyof T) => 
	(a: T, b: T): number => {
		const aValue = a[property];
		const bValue = b[property];
		if (typeof aValue === 'string' && typeof bValue === 'string') {
			return aValue.localeCompare(bValue);
		}
		return 0;
	}

export const sortNumber = <T>(property: keyof T, descending = false) =>
	(a: T, b: T): number => {
		const aValue = a[property];
		const bValue = b[property];
		if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
			return descending
				? Number(b[property]) - Number(a[property])
				: Number(a[property]) - Number(b[property]);
		}
		return 0;
	}

export const sortAlphabeticalThenSetState = <T>(setFunction: React.Dispatch<React.SetStateAction<T[]>>, array: T[], property: keyof T) => 
	setFunction(sorter(array, sortAlphabet(property)));

export const sortNumberThenSetState = <T>(setFunction: React.Dispatch<React.SetStateAction<T[]>>, array: T[], property: keyof T, descending = false) => 
	setFunction(sorter(array, sortNumber(property, descending)));