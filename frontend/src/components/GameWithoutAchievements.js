import { GameTitleInfo } from './GameTitleInfo';

export const GameWithoutAchievements = ({ game }) => {

	return (
		<div className={'gameWithoutAchievements'}>
			<GameTitleInfo game={game} />
		</div>
	)
}