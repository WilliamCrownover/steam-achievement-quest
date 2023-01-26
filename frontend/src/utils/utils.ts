export const between = (num, top, bottom) => (num < top && num >= bottom);

export const dateFormat = (timestamp) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', {});
}

export const round = (num: number) => num.toFixed(2);

export const sorter = (array, method) => array.sort(method);

export const sortAlphabet = (property) => (a, b) => a[property].localeCompare(b[property]);

export const sortNumber = (property, descending = false) => (a, b) => (descending ? b[property] : a[property]) - (descending ? a[property] : b[property]);