export const between = (num, top, bottom) => (num < top && num >= bottom);

export const dateFormat = (timestamp) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', {});
}

export const round = (num: number) => num.toFixed(2);
