import { GameTitleInfo } from './GameTitleInfo';
import { GamePriceInput } from './GamePriceInput';

export const GameWithoutAchievements = ({ game }) => {

	return (
		<div className={'gameWithoutAchievements'}>
			<GameTitleInfo game={game} />
			<GamePriceInput game={game} />
		</div>
	)
}