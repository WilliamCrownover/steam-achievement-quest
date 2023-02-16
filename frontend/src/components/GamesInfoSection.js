import { round } from '../utils/utils';
import { GameDataPoint } from './GameDataPoint';

export const GamesInfoSection = (props) => {
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
		totalPlaytime,
		totalNeverPlayed,
		totalOneHundredPercentComplete,
	} = userData;

	const hasAchievements = gamesWithAchievements.length > 0;

	const GameDataPoints = [
		{
			dataName: 'Total Number of Games',
			dataArray: totalNumberOfGames,
			total: totalNumberOfGames,
		},
		{
			dataName: 'With Achievements',
			dataArray: gamesWithAchievements,
			showPercent: true,
			total: totalNumberOfGames,
		},
		{
			dataName: 'Without Achievements',
			dataArray: gamesWithoutAchievements,
			showPercent: true,
			total: totalNumberOfGames,
		},
		{
			dataName: '100% Complete',
			dataArray: totalOneHundredPercentComplete,
			showPercent: true,
			total: totalNumberOfGames,
		},
		{
			dataName: 'Never Played',
			dataArray: totalNeverPlayed,
			showPercent: true,
			total: totalNumberOfGames,
		},
		{
			dataName: 'Number of Achievements',
			dataArray: totalAchievements,
			total: totalAchievements,
		},
		{
			dataName: 'Achievements Completed',
			dataArray: totalAchievementsCompleted,
			showPercent: true,
			total: totalAchievements,
		},
		{
			dataName: 'Achievements Completed',
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
					{privateProfile ?
						<GameDataPoint {...GameDataPoints[7]} />
						:
						<GameDataPoint {...GameDataPoints[6]} />
					}
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
				</div>
			</div>
		</div >
	)
}