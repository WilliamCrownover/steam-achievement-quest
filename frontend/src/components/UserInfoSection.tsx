import { PassDownSteamData } from '../models';
import { dateFormat } from '../utils/utils';

export const UserInfoSection = (props: PassDownSteamData) => {
	const {
		userData,
	} = props;

	const {
		avatar,
		personaname,
		realname,
		profileurl,
		lastlogoff,
		timecreated,
	} = userData;

	return (
		<div className='userInfoSection'>
			<a className='userNameImageContainer' href={profileurl} target='_blank' rel='noreferrer'>
				<img src={avatar} alt={personaname} height='80' />
				<div className='nameStack'>
					<h2 >{personaname}</h2>
					{realname && <h2 >{realname}</h2>}
				</div>
			</a>

			<div className='flexLineBreak' />

			{timecreated &&
				<div className='textStack'>
					<h3>Profile Created</h3>
					<h4>{dateFormat(timecreated)}</h4>
				</div>
			}

			{lastlogoff &&
				<div className='textStack'>
					<h3>Last Online</h3>
					<h4>{dateFormat(lastlogoff)}</h4>
				</div>
			}
		</div>
	)
}