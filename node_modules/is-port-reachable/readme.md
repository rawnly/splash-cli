# is-port-reachable [![Build Status](https://travis-ci.org/sindresorhus/is-port-reachable.svg?branch=master)](https://travis-ci.org/sindresorhus/is-port-reachable)

> Check if a local or remote port is reachable


## Install

```
$ npm install --save is-port-reachable
```


## Usage

```js
const isPortReachable = require('is-port-reachable');

isPortReachable(80, {host: 'google.com'}).then(reachable => {
	console.log(reachable);
	//=> true
});
```


## API

### isPortReachable(port, [options])

Returns a `Promise` for a `boolean`.

#### port

Type: `number`

#### options

##### host

Type: `string`<br>
Default: `localhost`

Can be a domain or an IP.

##### timeout

Type: `number`<br>
Default: `1000`

Milliseconds to wait before giving up.


## Related

- [is-reachable](https://github.com/sindresorhus/is-reachable/) - Check if servers are reachable 


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
