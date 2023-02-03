import { dateFormat } from '../utils/utils';

export const UserInfoSection = (props) => {
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
		<>
			<div className='userNameImageContainer'>
				<img src={avatar} alt={personaname} height='80' />
				<h2>{personaname} {realname && `(${realname})`}</h2>
			</div>
			<h3>Profile Link: <span><a href={profileurl} target='_blank' rel='noreferrer'>{profileurl}</a></span></h3>
			{lastlogoff && <h3>Last Online: {dateFormat(lastlogoff)}</h3>}
			{timecreated && <h3>Profile Created: {dateFormat(timecreated)}</h3>}
		</>
	)
}