'use strict';
const pSome = require('p-some');

module.exports = iterable => pSome(iterable, 1).then(values => values[0]);

module.exports.AggregateError = pSome.AggregateError;
