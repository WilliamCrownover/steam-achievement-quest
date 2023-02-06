import { percent } from '../utils/utils';

export const GameDataPoint = (props) => {
	const {
		dataName,
		dataArray,
		showPercent = false,
		total,
		privateProfile = false,
	} = props;

	const dataArrayValue = dataArray.length ? dataArray.length : dataArray;

	return (
		<div className='gameDataPoint'>
			<h3>{dataName}</h3>
			{privateProfile ?
				<p>This Steam user's achievements completed data is private.</p>
				:
				<h3>{dataArrayValue}{showPercent && (` - ${percent(dataArrayValue, total)}`)}</h3>
			}
		</div>
	)
}