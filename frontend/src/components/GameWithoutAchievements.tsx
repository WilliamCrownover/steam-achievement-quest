import { GameTitleInfo } from './GameTitleInfo';
import { GamePriceInput } from './GamePriceInput';
import { GameDataExpanded } from '../models';

type GameWithoutAchievementsProps = {
	game: GameDataExpanded
}

export const GameWithoutAchievements = ({ game }: GameWithoutAchievementsProps) => {

	return (
		<div className={'gameWithoutAchievements'}>
			<GameTitleInfo game={game} />
			<GamePriceInput game={game} />
		</div>
	)
}