# node-osx-wallpaper [![Build Status](https://travis-ci.org/sindresorhus/node-osx-wallpaper.svg?branch=master)](https://travis-ci.org/sindresorhus/node-osx-wallpaper)

> Get or set the desktop wallpaper on OS X using the [`osx-wallpaper`](https://github.com/sindresorhus/osx-wallpaper) binary


## Install

```
$ npm install --save osx-wallpaper
```


## Usage

```js
var osxWallpaper = require('osx-wallpaper');

osxWallpaper.set('unicorn.jpg', function (err) {
	console.log('done');
});

osxWallpaper.get(function (err, imagePath) {
	console.log(imagePath);
	//=> '/Users/sindresorhus/unicorn.jpg'
});
```


## API

### .get(callback)

#### callback(error, imagePath)

*Required*  
Type: `function`

##### imagePath

Type: `string`

Path to the current desktop wallpaper image.

### .set(imagePath, [callback])

##### imagePath

*Required*  
Type: `string`

Path to the image to set as the desktop wallpaper.


## CLI

```sh
# set
wallpaper unicorn.jpg

# get
wallpaper
> /Users/sindresorhus/unicorn.jpg
```


## Related

- [`wallpaper`](https://github.com/sindresorhus/wallpaper) - Get or set the desktop wallpaper.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
