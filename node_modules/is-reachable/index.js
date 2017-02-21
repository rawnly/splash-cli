'use strict';
const dns = require('dns');
const arrify = require('arrify');
const got = require('got');
const isPortReachable = require('is-port-reachable');
const pAny = require('p-any');
const pify = require('pify');
const pn = require('port-numbers');
const prependHttp = require('prepend-http');
const routerIps = require('router-ips');
const URL = require('url-parse');

const checkRedirection = url => {
	return got(url).then(res => {
		const redirectHostname = (new URL(res.headers.location || '')).hostname;

		if (routerIps.has(redirectHostname)) {
			return false;
		}

		return true;
	});
};

module.exports = dests => {
	return pAny(arrify(dests).map(url => {
		url = new URL(prependHttp(url));

		const hostname = url.hostname;
		const protocol = url.protocol;
		const port = url.port || pn.getPort(protocol.slice(0, -1)).port || 80;

		return pify(dns.lookup)(hostname).then(address => {
			if (!address) {
				return false;
			}

			if (routerIps.has(address)) {
				return false;
			}

			if (protocol === 'http' || protocol === 'https') {
				return checkRedirection(url.toString());
			}

			return isPortReachable(port, {host: address});
		});
	})).catch(() => false);
};
