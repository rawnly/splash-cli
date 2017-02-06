# router-ips [![Build Status](https://travis-ci.org/sindresorhus/router-ips.svg?branch=master)](https://travis-ci.org/sindresorhus/router-ips)

> List of common default router IP addresses

The list is just a [JSON file](router-ips.json) and can be used anywhere.


## Install

```
$ npm install --save router-ips
```


## Usage

```js
const routerIps = require('router-ips');

console.log(routerIps.has('192.168.0.1'));
//=> true
```


## API

### routerIps

Type: `Set`


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
