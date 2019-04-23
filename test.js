import test from 'ava';
import Unsplash from './build/extra/Unsplash';

const expressions = {
	PHOTO_ID: /[A-z0-9(-|_|)]+/gi,
	COLLECTION_ID: /[0-9]{3,}/gi,
};

test('TEST: Get Random Photo', async (t) => {
	const photo = await Unsplash.shared.getRandomPhoto();
	const result = expressions.PHOTO_ID.test(photo.id);
	t.is(result, true, `ID didn\'t match the expression: ${photo.id}`);
});

test('TEST: Get Photo Of The Day', async (t) => {
	const photo = await Unsplash.shared.picOfTheDay();

	t.not(photo.id, undefined);
});

// test('TEST: Get Photo\'s Download Link', async (t) => {
// 	const photo = await Unsplash.shared.getRandomPhoto();

// 	if (!photo.id) t.pass();

// 	const { url } = await Unsplash.shared.getDownloadLink(photo.id);

// 	if (url) {
// 		t.regex(url, expressions.PHOTO_ID);
// 	} else {
// 		t.pass();
// 	}
// });

test('TEST: Get Collection', async (t) => {
	const { id } = await Unsplash.shared.getCollection(3644553);
	t.regex('' + id, expressions.COLLECTION_ID);
});

test('TEST: Get User', async (t) => {
	const username = 'fedevitale';

	const user = await Unsplash.shared.getUser(username);
	t.is(user.username, username);
	t.regex(user.id, /[A-z0-9]/g);
});
