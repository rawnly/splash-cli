# first-run [![Build Status](https://travis-ci.org/sindresorhus/first-run.svg?branch=master)](https://travis-ci.org/sindresorhus/first-run)

> Check if it's the first time the process is run

Can be used to greet the user the first time they use your CLI app, show usage tip, initialize something, etc.


## Install

```
$ npm install --save first-run
```


## Usage

```js
// x.js
var firstRun = require('first-run');

console.log(firstRun());
```

```
$ node x.js
true
$ node x.js
false
```


## API

### firstRun([options])

#### options.name

Type: `string`  
Default: `name` field in your package.json

The name used to identify it.

### firstRun.clear()

Clear the state.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
