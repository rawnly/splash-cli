/* eslint-env browser */
'use strict';
const arrify = require('arrify');
const pAny = require('p-any');
const prependHttp = require('prepend-http');
const URL = require('url-parse');

module.exports = hosts => {
	return pAny(arrify(hosts).map(url => {
		return new Promise(resolve => {
			url = new URL(prependHttp(url));

			const hostname = url.hostname;
			const protocol = url.protocol || '';
			const port = url.port ? `:${url.port}` : '';

			const img = new Image();
			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);
			img.src = `${protocol}//${hostname}${port}/favicon.ico?${Date.now()}`;
		});
	}));
};
