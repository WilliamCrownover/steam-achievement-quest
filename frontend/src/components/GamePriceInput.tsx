import { useState } from "react";
import { GameDataExpanded } from "../models";
import { ReviewSelectDropdown } from "./ReviewSelectDropdown";

type GamePriceInputProps = {
	game: GameDataExpanded
}

export const GamePriceInput = ({ game }: GamePriceInputProps) => {
	const [cost, setCost] = useState(game.cost || "");
	const [price, setPrice] = useState(game.pricePaid || "");
	const [timeToBeat, setTimeToBeat] = useState(game.timeToBeat || "");
	const [purchaseDate, setPurchaseDate] = useState(game.purchaseDate || "");
	const [focused, setFocused] = useState(game.focused || false);



	const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setCost(value);
		e.preventDefault();
	}

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPrice(value);
		e.preventDefault();
	}

	const handleTimeToBeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTimeToBeat(value);
		e.preventDefault();
	}

	const handlePurchaseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPurchaseDate(value);
		e.preventDefault();
	}

	const handleFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.checked;
		setFocused(value);

		let gameFocus = JSON.parse(localStorage.getItem('gameFocus') ?? '{}');
		const gameId = game.appid;
		gameFocus = {
			...gameFocus,
			[gameId]: value
		}
		localStorage.setItem('gameFocus', JSON.stringify(gameFocus));
	}

	const handleSubmitCost = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gameCosts = JSON.parse(localStorage.getItem('gameCosts') ?? '');
		const gameId = game.appid;
		gameCosts = {
			...gameCosts,
			[gameId]: inputValue
		}
		localStorage.setItem('gameCosts', JSON.stringify(gameCosts))
		setCost(inputValue);
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gamePrices = JSON.parse(localStorage.getItem('gamePrices') ?? '');
		const gameId = game.appid;
		gamePrices = {
			...gamePrices,
			[gameId]: inputValue
		}
		localStorage.setItem('gamePrices', JSON.stringify(gamePrices))
		setPrice(inputValue);
	}

	const handleSubmitTimeToBeat = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gameTimesToBeat = JSON.parse(localStorage.getItem('gameTimesToBeat') ?? '');
		const gameId = game.appid;
		gameTimesToBeat = {
			...gameTimesToBeat,
			[gameId]: inputValue
		}
		localStorage.setItem('gameTimesToBeat', JSON.stringify(gameTimesToBeat))
		setTimeToBeat(inputValue);
	}

	const handleSubmitPurchaseDate = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const inputValue = (form.elements[0] as HTMLInputElement).value;
		let gamePurchaseDates = JSON.parse(localStorage.getItem('gamePurchaseDates') ?? '{}');
		const gameId = game.appid;
		gamePurchaseDates = {
			...gamePurchaseDates,
			[gameId]: inputValue
		}
		localStorage.setItem('gamePurchaseDates', JSON.stringify(gamePurchaseDates))
		setPurchaseDate(inputValue);
	}

	return (
		<div className='multipleForms'>
			<form className='formContainer formContainerTwo' onSubmit={handleSubmitCost}>
				<div>
					<label>
						Cost $
						<input type='number' step='0.01' value={cost} onChange={handleCostChange} />
					</label>
					<input type='submit' value='S' />
				</div>
			</form>
			<form className='formContainer formContainerTwo' onSubmit={handleSubmit}>
				<div>
					<label>
						Paid $
						<input type='number' step='0.01' value={price} onChange={handlePriceChange} />
					</label>
					<input type='submit' value='S' />
				</div>
			</form>
			<form className='formContainer formContainerTwo' onSubmit={handleSubmitTimeToBeat}>
				<div>
					<label>
						Time
						<input type='number' step='0.1' value={timeToBeat} onChange={handleTimeToBeatChange} />
					</label>
					<input type='submit' value='S' />
				</div>
			</form>
			<form className='formContainer formContainerTwo' onSubmit={handleSubmitPurchaseDate}>
				<div>
					<label>
						Purchase Date
						<input type='text' value={purchaseDate} onChange={handlePurchaseDateChange} />
					</label>
					<input type='submit' value='S' />
				</div>
			</form>
			<ReviewSelectDropdown game={game} />
			<form className='formContainer formContainerTwo'>
				<div>
					<label>
						Focus
						<input type='checkbox' checked={focused} onChange={handleFocusChange} />
					</label>
				</div>
			</form>
		</div>
	)
}