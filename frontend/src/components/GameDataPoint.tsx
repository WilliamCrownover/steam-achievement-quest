import { GameDataExpanded } from '../models';
import { percent } from '../utils/utils';

type GameDataPointProps = {
	dataName: string
	dataArray: GameDataExpanded[] | number
	showPercent?: boolean
	total: number
	privateProfile?: boolean
}

export const GameDataPoint = (props: GameDataPointProps) => {
	const {
		dataName,
		dataArray,
		showPercent = false,
		total,
		privateProfile = false,
	} = props;

	const dataArrayValue = Array.isArray(dataArray) ? dataArray.length : dataArray;

	return (
		<div className='gameDataPoint'>
			<h3>{dataName}</h3>
			{privateProfile ?
				<p>This Steam user's achievements data is private.</p>
				:
				<h3>{dataArrayValue}{showPercent && (` - ${percent(dataArrayValue, total)}`)}</h3>
			}
		</div>
	)
}