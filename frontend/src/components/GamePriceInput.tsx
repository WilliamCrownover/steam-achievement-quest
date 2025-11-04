import { useState } from 'react';
import { GameDataExpanded } from '../models';
import { ReviewSelectDropdown } from './ReviewSelectDropdown';
import { getOrSetFileStorage, saveDataToBackend } from '../utils/api';

type GamePriceInputProps = {
	game: GameDataExpanded;
	updateGameFocus?: (gameId: number, focused: boolean) => void;
	updateGameDemo?: (gameId: number, demo: boolean) => void;
};

export const GamePriceInput = ({ game, updateGameFocus, updateGameDemo }: GamePriceInputProps) => {
	const [cost, setCost] = useState(game.cost || '');
	const [price, setPrice] = useState(game.pricePaid || '');
	const [timeToBeat, setTimeToBeat] = useState(game.timeToBeat || '');
	const [purchaseDate, setPurchaseDate] = useState(game.purchaseDate || '');
	const [focused, setFocused] = useState(game.focused || false);
	const [demo, setDemo] = useState(game.demo || false);

	const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCost(value);
		e.preventDefault();
	};

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPrice(value);
		e.preventDefault();
	};

	const handleTimeToBeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTimeToBeat(value);
		e.preventDefault();
	};

	const handlePurchaseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPurchaseDate(value);
		e.preventDefault();
	};

	const handleFocusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked;
		setFocused(value);

		if (updateGameFocus) {
			updateGameFocus(game.appid, value);
		}

		let gameFocus = JSON.parse(await getOrSetFileStorage('gameFocus', '{}'));
		const gameId = game.appid;
		gameFocus = {
			...gameFocus,
			[gameId]: value,
		};
		await saveDataToBackend('gameFocus', gameFocus);
	};

	const handleDemoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked;
		setDemo(value);

		if (updateGameDemo) {
			updateGameDemo(game.appid, value);
		}

		let gameDemo = JSON.parse(await getOrSetFileStorage('gameDemo', '{}'));
		const gameId = game.appid;
		gameDemo = {
			...gameDemo,
			[gameId]: value,
		};
		await saveDataToBackend('gameDemo', gameDemo);
	};

	const handleSubmitCost = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gameCosts = JSON.parse(await getOrSetFileStorage('gameCosts', '{}'));
		const gameId = game.appid;
		gameCosts = {
			...gameCosts,
			[gameId]: inputValue,
		};
		await saveDataToBackend('gameCosts', gameCosts);
		setCost(inputValue);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gamePrices = JSON.parse(await getOrSetFileStorage('gamePrices', '{}'));
		const gameId = game.appid;
		gamePrices = {
			...gamePrices,
			[gameId]: inputValue,
		};
		await saveDataToBackend('gamePrices', gamePrices);
		setPrice(inputValue);
	};

	const handleSubmitTimeToBeat = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gameTimesToBeat = JSON.parse(await getOrSetFileStorage('gameTimesToBeat', '{}'));
		const gameId = game.appid;
		gameTimesToBeat = {
			...gameTimesToBeat,
			[gameId]: inputValue,
		};
		await saveDataToBackend('gameTimesToBeat', gameTimesToBeat);
		setTimeToBeat(inputValue);
	};

	const handleSubmitPurchaseDate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gamePurchaseDates = JSON.parse(await getOrSetFileStorage('gamePurchaseDates', '{}'));
		const gameId = game.appid;
		gamePurchaseDates = {
			...gamePurchaseDates,
			[gameId]: inputValue,
		};
		await saveDataToBackend('gamePurchaseDates', gamePurchaseDates);
		setPurchaseDate(inputValue);
	};

	return (
		<div className="multipleForms">
			<form className="formContainer formContainerTwo" onSubmit={handleSubmitCost}>
				<div>
					<label>
						Cost $
						<input type="number" step="0.01" value={cost} onChange={handleCostChange} />
					</label>
					<input type="submit" value="S" />
				</div>
			</form>
			<form className="formContainer formContainerTwo" onSubmit={handleSubmit}>
				<div>
					<label>
						Paid $
						<input
							type="number"
							step="0.01"
							value={price}
							onChange={handlePriceChange}
						/>
					</label>
					<input type="submit" value="S" />
				</div>
			</form>
			<form className="formContainer formContainerTwo" onSubmit={handleSubmitTimeToBeat}>
				<div>
					<label>
						Time
						<input
							type="number"
							step="0.1"
							value={timeToBeat}
							onChange={handleTimeToBeatChange}
						/>
					</label>
					<input type="submit" value="S" />
				</div>
			</form>
			<form className="formContainer formContainerTwo" onSubmit={handleSubmitPurchaseDate}>
				<div>
					<label>
						Purchase Date
						<input
							type="text"
							value={purchaseDate}
							onChange={handlePurchaseDateChange}
						/>
					</label>
					<input type="submit" value="S" />
				</div>
			</form>
			<ReviewSelectDropdown game={game} />
			<div className="formLineBreak" />
			<form className="formContainer formContainerTwo formContainerThree">
				<div>
					<label>
						Focus
						<input type="checkbox" checked={focused} onChange={handleFocusChange} />
					</label>
				</div>
			</form>
			<form className="formContainer formContainerTwo formContainerThree">
				<div>
					<label>
						Demo
						<input type="checkbox" checked={demo} onChange={handleDemoChange} />
					</label>
				</div>
			</form>
			<a
				className="youtubeLink formContainerThree"
				href={game.youtubeUrl}
				target="_blank"
				rel="noopener noreferrer"
			>
				YouTube
			</a>
			<a
				className="youtubeLink formContainerThree"
				href={game.howLongToBeatUrl}
				target="_blank"
				rel="noopener noreferrer"
			>
				HowLongToBeat
			</a>
		</div>
	);
};
