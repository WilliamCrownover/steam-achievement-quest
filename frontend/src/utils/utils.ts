export const dateFormat = (timestamp: number) => {
	if (timestamp <= 100000) return 'Not Played';
	const dateObject = new Date(timestamp * 1000);
	return dateObject.toLocaleString('en-US', { dateStyle: 'medium' });
}

export const percent = (num: number, total: number) => `${round(num / total * 100)}%`;

export const discount = (price: number, cost: number) => `${round((cost - price) / cost * 100)}%`;

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
			const aString = aValue.replace(/^The\s+/i, '');
			const bString = bValue.replace(/^The\s+/i, '');
			return aString.localeCompare(bString);
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

export const sortKeysByValue = (obj: { [key: string]: number }): string[] => {
	return Object.entries(obj)
		.sort(([, a], [, b]) => b - a)
		.map(([key]) => key);
};

export const sortAlphabeticalThenSetState = <T>(setFunction: React.Dispatch<React.SetStateAction<T[]>>, array: T[], property: keyof T) =>
	setFunction(sorter(array, sortAlphabet(property)));

export const sortNumberThenSetState = <T>(setFunction: React.Dispatch<React.SetStateAction<T[]>>, array: T[], property: keyof T, descending = false) =>
	setFunction(sorter(array, sortNumber(property, descending)));

export const getEnumKeyByValue = <T extends Object>(enumObj: T, value: string): keyof T | undefined => {
	return (Object.keys(enumObj) as Array<keyof T>).find(key => enumObj[key] === value);
}

export const getOrSetLocalStorage = (storedName: string, defaultData: string) => {
	const data = localStorage.getItem(storedName);
	if (!data) {
		localStorage.setItem(storedName, defaultData);
		return defaultData;
	}
	return data;
}

export const splitStringListToArray = (stringList: string | null) => {
	if (!stringList) return ["Unknown"];
	if (stringList === '') return ["Unknown"];

	let sanitized = stringList;
	const commaSuffixes = [
		{ pattern: /, Inc.\b/gi, replacement: " Inc" },
		{ pattern: /, Inc\b/gi, replacement: " Inc" },
		{ pattern: /, LLC\b/gi, replacement: " LLC" },
		{ pattern: /, Ltd.\b/gi, replacement: "Ltd" },
		{ pattern: /, LTD\b/gi, replacement: "Ltd" },
		{ pattern: /, LTD.\b/gi, replacement: "Ltd" },
		{ pattern: /, S\.L\.(?:\b|$)/gi, replacement: "" },
		{ pattern: /, a\.s\.(?:\b|$)/gi, replacement: "" },
		{ pattern: /, and\b/gi, replacement: "," },
		{ pattern: /\(Mac\)/gi, replacement: "" },
		{ pattern: /\(Linux\)/gi, replacement: "" },
		{ pattern: /\(Linux\/Mac\)/gi, replacement: "" },
		{ pattern: /\(Mac, Linux\)/gi, replacement: "" },
		{ pattern: /\(Mac, Linux, & Windows Update\)/gi, replacement: "" },
		{ pattern: /, a Ubisoft Studio\b/gi, replacement: " a Ubisoft Studio" },
		{ pattern: /in collaboration with\b/gi, replacement: "" },
		{ pattern: /DON'T NOD\b/gi, replacement: "DONTNOD Entertainment" },
		{ pattern: /Eidos Montreal\b/gi, replacement: "Eidos-Montréal" },
		{ pattern: /Io-Interactive A\/S\b/gi, replacement: "IO Interactive" },
		{ pattern: /Free to Play\b/gi, replacement: "Free To Play" },
	]

	commaSuffixes.forEach(({ pattern, replacement }) => {
		sanitized = sanitized.replace(pattern, replacement);
	});

	const individualStrings = sanitized.split(',').map(item => item.trim());
	
	const prefixes = [
		"22cans",
		"2K",
		"4Divinity",
		"Activision",
		"Arkane",
		"Aspyr",
		"BANDAI NAMCO",
		"Bethesda",
		"Blind Squirrel",
		"Bloober Team",
		"CAPCOM",
		"Codemasters Racing",
		"Comcept",
		"Croteam",
		"Crytek",
		"Cyanide Studio",
		"D3T",
		"Digital Dreams Entertainment",
		"EA",
		"Feral Interactive",
		"FireFly Studios",
		"FromSoftware Inc.",
		"GSC Game World",
		"High Voltage",
		"IDEA FACTORY",
		"Interplay",
		"IO Interactive",
		"Keen Games",
		"Marvelous",
		"Monolith",
		"Nixxes",
		"Oddworld Inhabitants",
		"PlatinumGames",
		"PlayStation Publishing LLC",
		"Reality Pump",
		"Red Storm",
		"Rockstar",
		"SEGA",
		"Shiver",
		"SkyBox Labs",
		"Stainless Games",
		"Starbreeze",
		"Team17",
		"Techland",
		"Telltale",
		"THQ Nordic",
		"TimeGate",
		"Topware Interactive",
		"Toronto",
		"TT Games",
		"Ubisoft",
		"UL",
		"Warner Bros.",
		"Wizards of the Coast",
		"方块游戏",
	];

	const processedStrings = individualStrings.map(item => {
		let processedItem = item;
		prefixes.forEach(prefix => {
			const pattern = new RegExp(`^(${prefix}).*`, 'i');
			processedItem = processedItem.replace(pattern, prefix);
		});
		return processedItem.trim();
	});

	return [...new Set(processedStrings)];
};