export const GameTitleInfo = ({ game }) => {
	const {
		gameIcon,
		hoursPlayed,
		lastPlayedDate,
		playerCount,
	} = game;

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
		</div>
	)
}