# p-any [![Build Status](https://travis-ci.org/sindresorhus/p-any.svg?branch=master)](https://travis-ci.org/sindresorhus/p-any)

> Wait for any promise to be fulfilled

Useful when you need the fastest promise.

You probably want this instead of `Promise.race()`. [Reason.](http://bluebirdjs.com/docs/api/promise.race.html)


## Install

```
$ npm install --save p-any
```


## Usage

Checks 3 websites and logs the fastest.

```js
const got = require('got');
const pAny = require('p-any');

pAny([
	got.head('github.com').then(() => 'github'),
	got.head('google.com').then(() => 'google'),
	got.head('twitter.com').then(() => 'twitter'),
]).then(first => {
	console.log(first);
	//=> 'google'
});
```


## API

### pAny(input)

Returns a `Promise` that is fulfilled when any promise from `input` is fulfilled. If all the `input` promises reject, it will reject with an [`AggregateError`](https://github.com/sindresorhus/aggregate-error) error.

#### input

Type: `Iterable<Promise|any>`

### pAny.AggregateError

Exposed for instance checking.


## Related

- [p-some](https://github.com/sindresorhus/p-some) - Wait for a specified number of promises to be fulfilled
- [More…](https://github.com/sindresorhus/promise-fun)


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
