import { setColorFill } from '../utils/utils'

export const GameTitleInfo = ({ game }) => {
	const {
		gameIcon,
		hoursPlayed,
		lastPlayedDate,
		playerCount,
		total_reviews,
		reviewPercentPositive,
	} = game;

	const colorFill = setColorFill((reviewPercentPositive * (100 + 90) / 100 - 90));

	return (
		<div className='gameTitleInfo'>
			<a className='gameTitleLink' href={game.gameUrl} target='_blank' rel='noreferrer'>
				<img src={gameIcon} alt={game.name} height='50' width='50' loading='lazy' />
				<div className='gameNameContainer'>
					<h3>{game.name}</h3>
					{game.has_dlc && <p className='dlc'>+DLC</p>}
				</div>
			</a>
			{hoursPlayed > 0 &&
				<div className='specificGameDataPoint'>
					<h4>Hours Played</h4>
					<p>{hoursPlayed}</p>
				</div>
			}
			<div className='specificGameDataPoint'>
				<h4>Last Played</h4>
				<p className={`${lastPlayedDate === 'Not Played' && 'notPlayed'}`}>{lastPlayedDate}</p>
			</div>
			<div className='specificGameDataPoint'>
				<h4>Current Players</h4>
				<p>{playerCount}</p>
			</div>
			<div className='specificGameDataPoint'>
				<h4>Total Reviews</h4>
				<p>{total_reviews}</p>
			</div>
			<div className='specificGameDataPoint' style={{ backgroundColor: colorFill, color: 'black' }}>
				<h4>Positive Reviews</h4>
				<p>{reviewPercentPositive}%</p>
			</div>
		</div>
	)
}