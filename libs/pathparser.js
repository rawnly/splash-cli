// PARSIN THE PATH
const path = require('path');
const os = require('os');

const join = path.join;

module.exports = path => {
	if (path !== undefined) {
		if (path.includes('~')) {
			const splitPath = path.split('/');

			splitPath.shift();

			const newPath = join(os.homedir(), splitPath.join('/'));
			return newPath;
		}
		return path;
	}

	return false;
};
