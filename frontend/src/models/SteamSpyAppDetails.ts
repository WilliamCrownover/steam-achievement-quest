interface Tags {
	[key: string]: number;
}

interface SharedSteamSpyAppDetails {
	name: string;
	owners: string;
	pullDate: Date;
}

export interface SteamSpyAppDetails extends SharedSteamSpyAppDetails {
	developer: string;
	publisher: string;
	languages: string;
	genre: string;
	tags: Tags;
}

export interface SteamSpyAppDetailsConverted extends Record<string, any>, SharedSteamSpyAppDetails {
	developer: string[];
	publisher: string[];
	languages: string[];
	genre: string[];
	tags: string[];
}
