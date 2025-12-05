import { ChangeEvent, useState } from 'react';
import { GameDataExpanded, ReviewEnum } from '../models';
import { getEnumKeyByValue } from '../utils/utils';
import { getOrSetFileStorage, saveDataToBackend } from '../utils/api';

type ReviewSelectDropdownProps = {
	game: GameDataExpanded;
};

export const ReviewSelectDropdown = ({ game }: ReviewSelectDropdownProps) => {
	const [review, setReview] = useState(game.review);

	const changeReview = async (e: ChangeEvent<HTMLSelectElement>) => {
		e.preventDefault();
		const value = e.target.value as keyof typeof ReviewEnum;
		const parsedValue = ReviewEnum[value];
		let myReviews = JSON.parse(await getOrSetFileStorage('myReviews', '{}'));
		const gameId = game.appid;
		myReviews = {
			...myReviews,
			[gameId]: parsedValue,
		};
		await saveDataToBackend('myReviews', myReviews);
		setReview(parsedValue);
	};

	return (
		<div className="sortOptionContainer sortOptionContainer2">
			<div className="sortOption sortOption2">
				<h4>My Review</h4>
				<select
					defaultValue={getEnumKeyByValue(ReviewEnum, review)}
					onChange={changeReview}
				>
					<option value={'noReview'}>{ReviewEnum.noReview}</option>
					<option value={'thumbsUp'}>{ReviewEnum.thumbsUp}</option>
					<option value={'thumbsDown'}>{ReviewEnum.thumbsDown}</option>
				</select>
			</div>
		</div>
	);
};
