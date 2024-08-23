import { useState } from "react";

export const GamePriceInput = ({ game }) => {
	const [cost, setCost] = useState(game.cost);
	const [price, setPrice] = useState(game.pricePaid);
	const [timeToBeat, setTimeToBeat] = useState(game.timeToBeat);

	const handleCostChange = (e) => {
		const value = e.target.value;
		setCost(value);
		e.preventDefault();
	}

	const handlePriceChange = (e) => {
		const value = e.target.value;
		setPrice(value);
		e.preventDefault();
	}

	const handleTimeToBeatChange = (e) => {
		const value = e.target.value;
		setTimeToBeat(value);
		e.preventDefault();
	}

	const handleSubmitCost = async (e) => {
		e.preventDefault();
		const inputValue = e.target[0].value;
		let gameCosts = JSON.parse(localStorage.getItem('gameCosts'));
		const gameId = game.appid;
		gameCosts = {
			...gameCosts,
			[gameId]: inputValue
		}
		localStorage.setItem('gameCosts', JSON.stringify(gameCosts))
		setCost(inputValue);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		const inputValue = e.target[0].value;
		let gamePrices = JSON.parse(localStorage.getItem('gamePrices'));
		const gameId = game.appid;
		gamePrices = {
			...gamePrices,
			[gameId]: inputValue
		}
		localStorage.setItem('gamePrices', JSON.stringify(gamePrices))
		setPrice(inputValue);
	}

	const handleSubmitTimeToBeat = async (e) => {
		e.preventDefault();
		const inputValue = e.target[0].value;
		let gameTimesToBeat = JSON.parse(localStorage.getItem('gameTimesToBeat'));
		const gameId = game.appid;
		gameTimesToBeat = {
			...gameTimesToBeat,
			[gameId]: inputValue
		}
		localStorage.setItem('gameTimesToBeat', JSON.stringify(gameTimesToBeat))
		setTimeToBeat(inputValue);
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
		</div>
	)
}