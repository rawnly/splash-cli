# indent-string [![Build Status](https://travis-ci.org/sindresorhus/indent-string.svg?branch=master)](https://travis-ci.org/sindresorhus/indent-string)

> Indent each line in a string


## Install

```
$ npm install --save indent-string
```


## Usage

```js
const indentString = require('indent-string');

indentString('Unicorns\nRainbows', 4);
//=> '    Unicorns'
//=> '    Rainbows'

indentString('Unicorns\nRainbows', 4, '♥');
//=> '♥♥♥♥Unicorns'
//=> '♥♥♥♥Rainbows'
```


## API

### indentString(input, [count], [indent])

#### input

Type: `string`

String you want to indent.

#### count

Type: `number`<br>
Default: `1`

How many times you want `indent` repeated.

#### indent

Type: `string`<br>
Default: `' '`

String to use for the indent.


## Related

- [indent-string-cli](https://github.com/sindresorhus/indent-string-cli) - CLI for this module
- [strip-indent](https://github.com/sindresorhus/strip-indent) - Strip leading whitespace from every line in a string


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
