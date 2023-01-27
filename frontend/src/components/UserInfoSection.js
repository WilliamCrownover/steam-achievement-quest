import { dateFormat } from '../utils/utils';

export const UserInfoSection = ({userData}) => {

	return (
		<>
			<h2>Username: {userData.personaname} {userData.realname && `(${userData.realname})`}</h2>
			<h3>Profile Link: <span><a href={userData.profileurl} target='_blank' rel='noreferrer'>{userData.profileurl}</a></span></h3>
			{userData.lastlogoff && <h3>Last Online: {dateFormat(userData.lastlogoff)}</h3>}
			{userData.timecreated && <h3>Profile Created: {dateFormat(userData.timecreated)}</h3>}
		</>
	)
}