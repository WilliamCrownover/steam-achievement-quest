import { GameTitleInfo } from './GameTitleInfo';

export const GameWithoutAchievements = ({ game }) => {

	return (
		<div className={'gameWithoutAchievements'}>
			<GameTitleInfo game={game} />
			<h3>No Achievements</h3>
		</div>
	)
}