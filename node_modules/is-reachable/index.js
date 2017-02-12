'use strict';
const dns = require('dns');
const arrify = require('arrify');
const got = require('got');
const isPortReachable = require('is-port-reachable');
const pAny = require('p-any');
const pify = require('pify');
const pn = require('port-numbers');
const pTimeout = require('p-timeout');
const prependHttp = require('prepend-http');
const routerIps = require('router-ips');
const URL = require('url-parse');

const checkRedirection = url => {
	return got(url).then(res => {
		return !routerIps.has((new URL(res.headers.location || '')).hostname);
	}).catch(() => false);
};

function isTargetReachable(url) {
	const uri = new URL(prependHttp(url));
	const hostname = uri.hostname;
	let protocol = uri.protocol;
	const port = Number(uri.port) || pn.getPort(protocol.slice(0, -1)).port || 80;

	if (!/^[a-z]+:\/\//.test(url) && port !== 80 && port !== 443) {
		protocol = pn.getService(port).name + ':';
	}

	return pify(dns.lookup)(hostname).then(address => {
		if (!address) {
			return false;
		}

		if (routerIps.has(address)) {
			return false;
		}

		if (protocol === 'http:' || protocol === 'https:') {
			return checkRedirection(url);
		}

		return isPortReachable(port, {host: address});
	}).catch(() => false);
}

module.exports = (dests, opts) => {
	opts = opts || {};
	opts.timeout = typeof opts.timeout === 'number' ? opts.timeout : 5000;

	const p = pAny(arrify(dests).map(isTargetReachable));
	return pTimeout(p, opts.timeout).catch(() => false);
};
