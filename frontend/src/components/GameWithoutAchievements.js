import { GameTitleInfo } from './GameTitleInfo';

export const GameWithoutAchievements = ({ game }) => {

	return (
		<>
			<GameTitleInfo game={game} />
			<h3>No Achievements</h3>
		</>
	)
}