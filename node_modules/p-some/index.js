'use strict';
const AggregateError = require('aggregate-error');

module.exports = (iterable, count) => new Promise((resolve, reject) => {
	if (!Number.isFinite(count)) {
		throw new TypeError(`Expected a finite number, got ${typeof count}`);
	}

	const values = [];
	const errors = [];
	let elCount = 0;
	let maxErrors = -count + 1;
	let done = false;

	const fulfilled = value => {
		if (done) {
			return;
		}

		values.push(value);

		if (--count === 0) {
			done = true;
			resolve(values);
		}
	};

	const rejected = error => {
		if (done) {
			return;
		}

		errors.push(error);

		if (--maxErrors === 0) {
			done = true;
			reject(new AggregateError(errors));
		}
	};

	for (const el of iterable) {
		maxErrors++;
		elCount++;
		Promise.resolve(el).then(fulfilled, rejected);
	}

	if (count > elCount) {
		throw new RangeError(`Expected input to contain at least ${count} items, but contains ${elCount} items`);
	}
});

module.exports.AggregateError = AggregateError;
