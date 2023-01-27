export const between = (num, top, bottom) => (num < top && num >= bottom);

export const dateFormat = (timestamp) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', {});
}

export const round = (num: number) => num.toFixed(2);

export const setColorFill = (number) => {
	const percent = parseInt(number) / 100;
	const redIncrease = 255 * (1 - percent)
	const greenIncrease = 100 + 155 * (1 - percent)
	const greenDecrease = 100 + 155 * (percent)
	const greenDecreaseMax = greenIncrease * (percent * 10)
	switch (true) {
		case number >= 90:
			return 'rgb(0,255,0)';
		case number >= 50:
			return `rgb(${redIncrease},${greenDecrease},0)`;
		case number >= 10:
			return `rgb(${redIncrease},${greenIncrease},0)`;
		case number >= 1:
			return `rgb(${redIncrease},${greenDecreaseMax},0)`;
		case number >= 0.11:
			return 'rgb(200,0,0)'
		default:
			return 'rgb(150,0,0)'
	}
}

export const sorter = (array, method) => array.sort(method);

export const sortAlphabet = (property) => (a, b) => a[property].localeCompare(b[property]);

export const sortNumber = (property, descending = false) => (a, b) => (descending ? b[property] : a[property]) - (descending ? a[property] : b[property]);

export const sortAlphabeticalThenSetState = (setFunction, array, property) => setFunction(sorter(array, sortAlphabet(property)));

export const sortNumberThenSetState = (setFunction, array, property, descending = false) => setFunction(sorter(array, sortNumber(property, descending)));