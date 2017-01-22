'use strict';
const path = require('path');
const execa = require('execa');

const create = (columns, rows) => ({
	columns: parseInt(columns, 10),
	rows: parseInt(rows, 10)
});

module.exports = () => {
	const env = process.env;
	const stdout = process.stdout;
	const stderr = process.stderr;

	if (stdout && stdout.columns && stdout.rows) {
		return create(stdout.columns, stdout.rows);
	}

	if (stderr && stderr.columns && stderr.rows) {
		return create(stderr.columns, stderr.rows);
	}

	// these values are static, so not the first choice
	if (env.COLUMNS && env.LINES) {
		return create(env.COLUMNS, env.LINES);
	}

	if (process.platform === 'win32') {
		try {
			// binary: https://github.com/sindresorhus/win-term-size
			const size = execa.sync(path.join(__dirname, 'win-term-size.exe')).stdout.split(/\r?\n/);

			if (size.length === 2) {
				return create(size[0], size[1]);
			}
		} catch (err) {}
	} else {
		// `resize` is preferred as it works even when all file descriptors are redirected
		try {
			const size = execa.sync('resize', ['-u']).stdout.match(/\d+/g);

			if (size.length === 2) {
				return create(size[0], size[1]);
			}
		} catch (err) {}

		try {
			const columns = execa.sync('tput', ['cols']).stdout;
			const rows = execa.sync('tput', ['lines']).stdout;

			if (columns && rows) {
				return create(columns, rows);
			}
		} catch (err) {}
	}

	return create(80, 24);
};
