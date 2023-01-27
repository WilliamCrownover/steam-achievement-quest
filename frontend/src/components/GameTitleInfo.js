export const GameTitleInfo = ({ game }) => {
	const hoursPlayed = game.hoursPlayed;

	return (
		<div className='gameTitleInfo'>
			<a className='gameTitleLink' href={game.gameUrl} target='_blank' rel='noreferrer'>{game.name}</a>
			{hoursPlayed > 0 && <p>{`${hoursPlayed} Hours Played`}</p>}
			<p>{game.lastPlayedDate}</p>
		</div>
	)
}