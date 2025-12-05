type SpecificGameDataPointProps = {
	title: string
	data: string | number
	isGoodValue?: boolean
	isBadValue?: boolean
	isPercent?: boolean
}

export const SpecificGameDataPoint = (props: SpecificGameDataPointProps) => {
	const {
		title,
		data,
		isGoodValue = false,
		isBadValue = false,
		isPercent = false
	} = props;

	const dataString = isPercent ? `${data}%` : data
	const goodValueHighlight = isGoodValue ? 'goodValueHighlight' : ''
	const badValueHighlight = isBadValue ? 'badValueHighlight' : ''

	return (
		<div className={`specificGameDataPoint ${goodValueHighlight} ${badValueHighlight}`}>
			<h4>{title}</h4>
			<p>{dataString}</p>
		</div>
	);
}