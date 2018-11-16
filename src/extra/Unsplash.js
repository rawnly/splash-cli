import { URL } from 'url';

import got from 'got';
import parseID from '@splash-cli/parse-unsplash-id';
import { JSDOM } from 'jsdom';

import { parseCollection, tryParse, errorHandler, addTimeTo, now } from './utils';
import { keys, config } from './config';


export default class Unsplash {
	endpoint = new URL('https://api.unsplash.com')

	static shared = new Unsplash(keys.client_id)

	constructor(client_id) {
		this.endpoint.searchParams.set('client_id', client_id);
	}

	async getRandomPhoto({ collection = false, query = false, username = false, featured = false, count = 1 } = {}) {
		const endpoint = this.endpoint;

		// Setup the route
		endpoint.pathname = '/photos/random';

		// Safe verification
		if ( typeof count === 'number' ) {
			// Get only 1 photo
			endpoint.searchParams.set('count', count);
		}

		// Parse collection aliases
		if ( collection ) {
			if (collection.includes(',')) {
				collection = collection.split(',').map(parseCollection).join(',');

				endpoint.searchParams.set('collections', collection);
			} else {
				endpoint.searchParams.set('collections', collection);
			}
		}

		// Encode query
		if ( query ) {
			endpoint.searchParams.set('query', query);
		}

		// Encode username
		if ( username ) {
			endpoint.searchParams.set('username', username);
		}

		// Limit to featured photos
		if ( typeof featured === 'boolean' ) {
			endpoint.searchParams.set('featured', featured);
		}


		try {
			const response = await got(this.endpoint.href);

			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));

			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async getPhoto(id) {
		const endpoint = this.endpoint;

		endpoint.pathname = `/photos/${parseID(id)}`;

		try {
			const response = await got(this.endpoint.href);

			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));

			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async getDownloadLink(id) {
		const endpoint = this.endpoint;

		endpoint.pathname = `/photos/${parseID(id)}/download`;

		try {
			const response = await got(this.endpoint.href);

			if (response.statusCode !== 200) return errorHandler(new Error(response.statusMessage));

			return tryParse(response.body);
		} catch (error) {
			errorHandler(error);
		}
	}

	async picOfTheDay() {
		const configKey = 'pic-of-the-day';

		if ( config.has(configKey) ) {
			const setting = config.get(configKey);

			const lastUpdate = new Date(setting.date.lastUpdate);
			const willUpdate = addTimeTo(lastUpdate, setting.date.delay);
		
			if ( willUpdate >= lastUpdate ) return this.getPhoto(setting.photo);
		}

		try {
			const { body: html } = await got('https://unsplash.com');
			const { window: { document } } = new JSDOM(html);

			const id = Array.from(document.querySelectorAll('a')).find(el => /Photo of the day/i.test(el.innerHTML)).href.match(/[a-zA-Z0-9_-]{11}/g)[0];

			config.set('pic-of-the-day', {
				photo: id,
				date: {
					lastUpdate: now(),
					delay: 1000 * 60 * 30
				}
			});

			return this.getPhoto(id);
		} catch (error) {
			errorHandler(error);
		}
	}
}
