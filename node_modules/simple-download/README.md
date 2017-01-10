# Simple Download
Easy download files from **url**.

## Install
```bash
	$ npm install --save simple-download
```

## Usage
```js
	const download = require('simple-download');

    var url = 'https://example.com/img.jpg';

    // file_name, url, destination, callback()
    download('myPhoto', url, './');
```
See the [example](example.js) or the [Live Example](https://runkit.com/5861c08251463100141ed278/5861c08251463100141ed279)

## API

### file_name
- Type: `string`
- Default: **random** readable string
- required: `false`
- extension: *Automatic if url contains the file name*

### url
- Type: `string`
- required: `true`

### destination

- Type: `string`
- Default: './'

### callback
Will be executed when download it's finished.
- Type: `function()`
- Default: `null`
