export const GameTitleInfo = ({ game }) => {
	const {
		hoursPlayed,
		lastPlayedDate,
		playerCount,
	} = game;

	return (
		<div className='gameTitleInfo'>
			<a className='gameTitleLink' href={game.gameUrl} target='_blank' rel='noreferrer'>{game.name}</a>
			{game.has_dlc && <p className='dlc'>+DLC</p>}
			{hoursPlayed > 0 && <p>{`${hoursPlayed} Hours Played`}</p>}
			<p className={`${lastPlayedDate === 'Not Played' && 'notPlayed'}`}>{lastPlayedDate}</p>
			<p>{playerCount} Current Players</p>
		</div>
	)
}