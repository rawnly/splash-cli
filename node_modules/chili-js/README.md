# ChiliJs

Usefuls variables for node env.

## Install
**NPM**
```bash
  $ [sudo] npm install chili-js --save
```

**Yarn**
```bash
  $ [sudo] yarn add chili-js
```

## Features / API

### Join(string)
Type: `function` <br>
Input: `String` <br>
*Example*:
```js
  require('chili-js');
  join('path', 'to', 'file')
  //=> 'path/to/file'
```

### Console Shortcuts
#### log | warn | error

Type: `function`
Example:
```js
  log('Hello') //=> 'Hello'
  warn('Warning!') //=> 'Warning!'
  error('There is an error!') //=> 'There is an error!'
```

### FS Shortcuts
Type: `function`
Example:
```js
  // FS read & write | Async
  write(filename, text, callback())
  writeSync(filename, text)

  // FS read & write | Sync
  read(filename, callback())
  readSync(filename)
```

### Variables

```js
  // Get user main folder
  home //=> /Users/<username>/

  // Get Username
  user //=> <username>
```

### Standalone Functions
* `capitalize(string)`
```js
  capitalize('hello') //=> 'Hello'
```
* `printArray(array)`
```js
  printArray(['my', 'array']) //=> will log all array items
```

<h3 align="center"> Made with love by Rawnly </h3>
