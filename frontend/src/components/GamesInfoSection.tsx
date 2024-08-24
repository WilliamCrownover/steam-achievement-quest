import { PassDownSteamData } from '../models';
import { round } from '../utils/utils';
import { GameDataPoint } from './GameDataPoint';

export const GamesInfoSection = (props: PassDownSteamData) => {
	const {
		userData,
		gamesWithAchievements,
		gamesWithoutAchievements,
	} = props;

	const {
		privateProfile,
		totalNumberOfGames,
		totalAchievements,
		totalAchievementsCompleted,
		totalAchievementsIncomplete,
		totalPlaytime,
		totalNeverPlayed,
		totalOneHundredPercentComplete,
		totalCosts,
		totalPayed,
		totalTimeToBeat,
	} = userData;

	const hasAchievements = gamesWithAchievements.length > 0;

	const GameDataPoints = [
		// 1
		{
			dataName: 'Total Number of Games',
			dataArray: totalNumberOfGames,
			total: totalNumberOfGames,
		},
		// 2
		{
			dataName: 'With Achievements',
			dataArray: gamesWithAchievements,
			showPercent: true,
			total: totalNumberOfGames,
		},
		// 3
		{
			dataName: 'Without Achievements',
			dataArray: gamesWithoutAchievements,
			showPercent: true,
			total: totalNumberOfGames,
		},
		// 4
		{
			dataName: '100% Complete',
			dataArray: totalOneHundredPercentComplete,
			showPercent: true,
			total: gamesWithAchievements.length,
		},
		// 5
		{
			dataName: 'Never Played',
			dataArray: totalNeverPlayed,
			showPercent: true,
			total: totalNumberOfGames,
		},
		// 6
		{
			dataName: 'Total Cost',
			dataArray: totalCosts,
			total: totalCosts,
		},
		// 7
		{
			dataName: 'Total Paid',
			dataArray: totalPayed,
			total: totalPayed,
		},
		// 8
		{
			dataName: 'Number of Achievements',
			dataArray: totalAchievements,
			total: totalAchievements,
		},
		// 9
		{
			dataName: 'Not Achieved',
			dataArray: totalAchievementsIncomplete,
			showPercent: true,
			total: totalAchievements,
			privateProfile: privateProfile,
		},
		// 10
		{
			dataName: 'Achieved',
			dataArray: totalAchievementsCompleted,
			showPercent: true,
			total: totalAchievements,
			privateProfile: privateProfile,
		},
	]

	return (
		<div className='gamesInfoSection'>
			<GameDataPoint {...GameDataPoints[0]} />
			{hasAchievements &&
				<>
					<GameDataPoint {...GameDataPoints[1]} />
					<GameDataPoint {...GameDataPoints[2]} />
					<GameDataPoint {...GameDataPoints[3]} />
				</>
			}
			<GameDataPoint {...GameDataPoints[4]} />

			<div className='flexLineBreak' />

			{hasAchievements &&
				<>
					<GameDataPoint {...GameDataPoints[5]} />
					<GameDataPoint {...GameDataPoints[6]} />
					<GameDataPoint {...GameDataPoints[7]} />
					<GameDataPoint {...GameDataPoints[8]} />
					<GameDataPoint {...GameDataPoints[9]} />
				</>
			}

			<div className='flexLineBreak' />

			<div className='gameDataPoint'>
				<h3>Total Time Played</h3>
				<div className='timePlayedContainer'>
					<h3>{totalPlaytime} Hours</h3>
					<h3>{round(totalPlaytime / 24)} Days</h3>
					<h3>{round(totalPlaytime / 24 / 7)} Weeks</h3>
					<h3>{round(totalPlaytime / 24 / 7 / 52)} Years</h3>
					<h3>{totalTimeToBeat} Hours to Beat</h3>
				</div>
			</div>
		</div >
	)
}