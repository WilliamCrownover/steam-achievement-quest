export const GameTitleInfo = ({game}) => {

	return (
		<div className='gameTitleInfo'>
			<h2>{game.name}</h2>
			{game.hoursPlayed > 0 && <p>{`${game.hoursPlayed} Hours Played`}</p>}
			<p>{game.lastPlayedDate}</p>
		</div>
	)
}