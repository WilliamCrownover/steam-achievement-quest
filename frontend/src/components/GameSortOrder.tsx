import { ChangeEvent } from 'react';
import { GameDataExpanded, PassDownSteamData } from '../models';
import {
	sorter,
	sortNumber,
	sortAlphabeticalThenSetState,
	sortNumberThenSetState
} from '../utils/utils';

export const GameSortOrder = (props: PassDownSteamData) => {
	const {
		userData,
		gamesWithAchievements,
		setGamesWithAchievements,
		gamesWithoutAchievements,
		setGamesWithoutAchievements,
	} = props;

	const hasAchievements = gamesWithAchievements.length > 0;

	// Console.log count of dates by year and month
	const countPurchaseDates = (games: GameDataExpanded[]) => {
		const purchaseDates: { [key: string]: {[key: string]: number }} = {};
		for(let year = 2010; year <= 2025; year++) {
			for(let month = 1; month <= 12; month++) {
				const monthString = month < 10 ? `0${month}` : `${month}`;
				purchaseDates[year] = {
					...purchaseDates[year],
					[monthString]: 0
				};
			}
		}
		games.forEach(game => {
			const dateYear = game.purchaseDate.split('-')[0];
			const dateMonth = game.purchaseDate.split('-')[1];
			if (dateYear) {
				purchaseDates[dateYear] = {
					...purchaseDates[dateYear],
					[dateMonth]: (purchaseDates[dateYear]?.[dateMonth] || 0) + 1
				};
			}
		});
		console.log('Purchase Dates Count:', purchaseDates);
		const purchaseDatesYearTotals: { [key: string]: number } = {};
		Object.keys(purchaseDates).forEach(year => {
			purchaseDatesYearTotals[year] = Object.values(purchaseDates[year]).reduce((acc, count) => acc + count, 0);
		});
		console.log('Purchase Dates Year Totals:', purchaseDatesYearTotals);
	}

	const changeGameOrder = (e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		sortAlphabeticalThenSetState(
			setGamesWithoutAchievements,
			gamesWithoutAchievements,
			'name'
		);
		const sharedSort = (property: string) => {
			sortNumberThenSetState(
				setGamesWithAchievements,
				[...gamesWithAchievements],
				property,
				true
			);
			sortNumberThenSetState(
				setGamesWithoutAchievements,
				[...gamesWithoutAchievements],
				property,
				true
			);
		}
		switch (true) {
			case value === 'name':
				sortAlphabeticalThenSetState(
					setGamesWithAchievements,
					[...gamesWithAchievements],
					value
				);
				break;
			case value === 'hoursPlayed':
				sharedSort(value);
				break;
			case value === 'rtime_last_played':
				sharedSort(value);
				break;
			case value === 'playerCount':
				sharedSort(value);
				break;
			case value === 'ownersCount':
				sharedSort(value);
				break;
			case value === 'total_reviews':
				sharedSort(value);
				break;
			case value === 'reviewPercentPositive':
				sharedSort(value);
				break;
			case value === 'cost':
				sharedSort(value);
				break;
			case value === 'pricePaid':
				sharedSort(value);
				break;
			case value === 'timeToBeat':
				sharedSort(value);
				break;
			case value === 'purchaseDate':
				sortAlphabeticalThenSetState(
					setGamesWithAchievements,
					[...gamesWithAchievements],
					value
				);
				sortAlphabeticalThenSetState(
					setGamesWithoutAchievements,
					[...gamesWithoutAchievements],
					value
				);
				countPurchaseDates([...gamesWithAchievements, ...gamesWithoutAchievements]);
				break;
			case value === 'pricePerHour':
				sharedSort(value);
				break;
			case value === 'costPerTimeToBeat':
				sharedSort(value);
				break;
			case value === 'discountPercent':
				sharedSort(value);
				break;
			case value === 'totalAchievements':
				sortNumberThenSetState(
					setGamesWithAchievements,
					[...gamesWithAchievements],
					value
				);
				break;
			case value === 'totalCompletedAchievements':
				sortNumberThenSetState(
					setGamesWithAchievements,
					[...sorter(
						[...gamesWithAchievements],
						sortNumber('totalIncompleteAchievements')
					)],
					value,
					true
				);
				break;
			case value === 'totalIncompleteAchievements':
				sortNumberThenSetState(
					setGamesWithAchievements,
					[...gamesWithAchievements],
					value
				);
				break;
			case value === 'percentComplete':
				sortNumberThenSetState(
					setGamesWithAchievements,
					[...sorter(
						[...gamesWithAchievements],
						sortNumber('totalAchievements')
					)],
					value,
					true
				);
				break;
			case value === 'averagePercent':
				sortNumberThenSetState(
					setGamesWithAchievements,
					[...gamesWithAchievements],
					value,
					true
				);
				break;
			case value === 'lowestAchievementPercent':
				sortNumberThenSetState(
					setGamesWithAchievements,
					[...gamesWithAchievements],
					value,
					true
				);
				break;
			default:
				return;
		}
	}

	return (
		<div className='sortOption'>
			<h4>Game Sort Order</h4>
			<select defaultValue='name' onChange={changeGameOrder}>
				<option value='name' > Alphabetical</option>
				<option value='hoursPlayed' > Playtime</option>
				<option value='rtime_last_played' > Last Played Date</option>
				<option value='playerCount' > Current Player Count</option>
				<option value='ownersCount' > Owners Count</option>
				<option value='total_reviews' > Total Reviews</option>
				<option value='reviewPercentPositive' > Positive Review Percent</option>
				<option value='cost' > Game Cost</option>
				<option value='pricePaid' > Price Paid</option>
				<option value='timeToBeat' > Time to Beat</option>
				<option value='purchaseDate' > Purchase Date</option>
				<option value='pricePerHour' > Price per Hour</option>
				<option value='costPerTimeToBeat' > Cost per Time to Beat</option>
				<option value='discountPercent' > Discount Percent</option>
				{hasAchievements &&
					<>
						<option value='totalAchievements' > Total Achievements</option>
						{!userData.privateProfile &&
							<>
								<option value='totalCompletedAchievements'>Total Achievements Complete</option>
								<option value='totalIncompleteAchievements'>Total Achievements Incomplete</option>
								<option value='percentComplete'>Percent Complete</option>
							</>
						}
						<option value='averagePercent' > Average Global Achievement Percent</option>
						<option value='lowestAchievementPercent' > Lowest Achievement Percent per Game</option>
					</>
				}
			</select>
		</div>
	)
}