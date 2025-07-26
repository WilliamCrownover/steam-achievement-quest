interface Tags {
    [key: string]: number;
}

interface SharedSteamSpyAppDetails {
    appid: number;
    name: string;
    score_rank: string;
    positive: number;
    negative: number;
    userscore: number;
    owners: string;
    average_forever: number;
    average_2weeks: number;
    median_forever: number;
    median_2weeks: number;
    price: string;
    initialprice: string;
    discount: string;
    ccu: number;
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