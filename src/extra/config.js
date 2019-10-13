import { pathFixer } from '../extra/utils';

import Conf from 'conf';

export const defaultSettings = {
	lastWP: null,
	'confirm-wallpaper': false,
	directory: pathFixer('~/Pictures/splash_photos'),
	aliases: [
		{ name: 'editorial', id: 317099 },
		{ name: 'wallpapers', id: 1065976 },
		{ name: 'textures', id: 3330445 }
	],
	userFolder: false,
	counter: 0,
	askForLike: true,
	askForCollection: false,
	picOfTheDay: {
		date: {
			lastUpdate: new Date('18 June 1999').getTime(),
			delay: 1000 * 60 * 30
		}
	}
};

export const config = new Conf({ defaults: defaultSettings });

export const keys = {
	client_id: '891db6b7b57458f71f6d0c54918fa150c269dec61e6cfd3ce51a0d74e89e6df2',
	client_secret: 'c415049c76eed5e2d072b49191be46d78f27609f4e273a64e37e0f7b2324d9ad',
	redirect_uri: 'http://localhost:5835/'
};

if (config.has('user') && config.get('user').token) {
	config.set('keys', {
		applicationId: keys.client_id,
		secret: keys.client_secret,
		callbackUrl: keys.redirect_uri,
		bearerToken: config.get('user').token
	});
} else {
	config.set('keys', {
		applicationId: keys.client_id,
		secret: keys.client_secret,
		callbackUrl: keys.redirect_uri,
	});
}

export const commandsList = {};
