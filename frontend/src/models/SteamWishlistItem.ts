import { SteamOwnedGame } from './SteamOwnedGame';

export interface SteamWishlistItem extends SteamOwnedGame {
	appid: number;
	date_added: number;
}
