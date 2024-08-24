import { GameDataExpanded } from '../models';
import { setColorFill } from '../utils/utils'

type GameTitleInfoProps = {
	game: GameDataExpanded
}

export const GameTitleInfo = ({ game }: GameTitleInfoProps) => {
	const {
		name,
		gameIcon,
		hoursPlayed,
		lastPlayedDate,
		playerCount,
		total_reviews,
		reviewPercentPositive,
		gameUrl,
		has_dlc
	} = game;

	const colorFill = setColorFill((reviewPercentPositive * (100 + 90) / 100 - 90));

	return (
		<div className='gameTitleInfo'>
			<a className='gameTitleLink' href={gameUrl} target='_blank' rel='noreferrer'>
				<img src={gameIcon} alt={name} height='50' width='50' loading='lazy' />
				<div className='gameNameContainer'>
					<h3>{name}</h3>
					{has_dlc && <p className='dlc'>+DLC</p>}
				</div>
			</a>
			<div className='playtimeDataContainer'>
				<div className='specificGameDataPoint'>
					<h4>Last Played</h4>
					<p className={`${lastPlayedDate === 'Not Played' && 'notPlayed'}`}>{lastPlayedDate}</p>
				</div>
				{hoursPlayed > 0 &&
					<div className='specificGameDataPoint'>
						<h4>Hours Played</h4>
						<p>{hoursPlayed}</p>
					</div>
				}
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