export const GameTitleInfo = ({game}) => {
	const hoursPlayed = game.hoursPlayed;

	return (
		<div className='gameTitleInfo'>
			<h2>{game.name}</h2>
			{hoursPlayed > 0 && <p>{`${hoursPlayed} Hours Played`}</p>}
			<p>{game.lastPlayedDate}</p>
		</div>
	)
}