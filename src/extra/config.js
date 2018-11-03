import fetch from 'isomorphic-fetch';

import { pathFixer } from '../extra/utils';
import Unsplash from 'unsplash-js';
import Conf from 'conf';


export const defaultSettings = {
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
			lastUpdate: new Date('18 June 1999'),
			delay: 1000 * 60 * 30
		}
	}
};

export const config = new Conf({ defaults: defaultSettings });

export const keys = {
	client_id: 'a70f2ffae3634a7bbb5b3f94998e49ccb2e85922fa3215ccb61e022cf57ca72c',
	client_secret: '0a86783ec8a023cdfa38a39e9ffab7f1c974e48389dc045a8e4b3978d6966e94',
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

export const unsplash = new Unsplash(config.get('keys'));


export const commandsList = {};