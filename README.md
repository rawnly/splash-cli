# Splash

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/df39aef5f5a14b62a8cf4701a7962c29)](https://www.codacy.com/app/fedevitale99/splash-cli?utm_source=github.com&utm_medium=referral&utm_content=Rawnly/splash-cli&utm_campaign=badger)
[![Downloads][downloads-image]][npm-url]
![version](https://img.shields.io/badge/version-1.4.0-brightgreen.svg)
[![Build Status](https://travis-ci.org/Rawnly/splash-cli.svg?branch=master)](https://travis-ci.org/Rawnly/splash-cli)

Set your wallpaper with beautiful photos from [unsplash](http://unsplash.com)

![screen](https://cloud.githubusercontent.com/assets/16429579/21467810/3f37f348-c9fa-11e6-9c6a-82fa8364f5e6.png)
> Got the same setup [here](http://github.com/Rawnly/dot-files)



## Installation

To install `splash-cli` you must use **npm** (as always) and do the following:

```bash
	$ npm i -g splash-cli
	# or
	$ yarn global add splash-cli
```


## Usage
![](https://cloud.githubusercontent.com/assets/11269635/21428079/7b24cc80-c858-11e6-8dc3-2e164d23804a.gif)
> All the photos are stored by default in `~/Pictures/splash_photos` [edit this value](#flags)

```bash
	$ splash [--flags]
```

## Compatibility
I've tested it on **macOS 10.12.2** and **windows 10**. Unfortunatley I actually can't test it on **Linux** systems but should works fine. For any issues please report it, I'll try to fix them all.

## Flags / Options
- ###  DIR
	Option: `--dir [path]` <br>
	Shortcut: `-d` <br>
	<br>

	Set the default download directory.
	```bash
		$ splash --dir ~/Desktop
		# //=> `~/Pictures/splash_photos` ==> `~/Desktop`
	```

	else you can use this option to get the current download directory

	```bash
		$ splash --dir
		# //=> At the moment the directory is '~/Pictures/splash_photos'
```

- ###  SAVE
	Option: `--save [path]` <br>
	Shortcut: `-s` <br>
	<br>

	Save the downloaded photo to a local folder if specified, or to the usually `~/Pictures/splash_photos`
	```bash
		$ splash --save ~/Desktop
	```

- ### INFO
	Option: `--info` <br>
	Shortcut: `-i` <br>
	<br>
	Normal usage but when finish to download the photo prints **ID**, **EXIF** and **author url**.
	```bash
		$ splash -i   # or --info

		# You can also combine it with --id
		$ splash -i --id EXAMPLE_PHOTO_ID
	```
	![info](https://cloud.githubusercontent.com/assets/16429579/21467813/7c7c4de4-c9fa-11e6-92db-adffb3e091a5.png)

- ###  ID
	Option: `--id <id | url>` <br>
	Shortcut: `none` <br>
	<br>

	Get the image from **ID** or **URL**.

	> You can get the image id on the [unsplash website](https://unsplash.com) by opening an image and grabbing the **ID** from the url.

	> https://unsplash.com/?photo=`EXAMPLE_PHOTO_ID`

	If you have ever downloaded the photo with **splash-cli** and it is in your actual download folder it will not be downloaded again.
	```bash
		$ splash --id YJ9ygJAVzmO
		# or
		$ splash --id https://unsplash.com/?photo=YJ9ygJAVzmO
	```

- ### CLEAN
	Option: `--clean` <br>
	Shortcut: `-c` <br>
	<br>
	Delete all downloaded photos.
	```bash
		$ splash --clean 		
	```

- ### RESTORE
	Option: `--restore` <br>
	<br>
	Restore default settings.

- ### UPDATE
	Option: `--update` <br>
	Shortcut: `-u` <br>
	<br>
	Download  and install the latest version.
	```bash
		$ splash --update 		 
	```

- ### LIST
	Option: `--list` <br>
	Shortcut: `-l` <br>
	<br>
	Print an array with the list of the downloaded photos.
	```bash
		$ splash -l 		
	```
	You can also export it with `--export`
	```bash
		$ splash -l --export
	```
	> NOTE: File names are photos id

	<br>
	<br>


## Related
- [ora](https://github.com/sindresorhus/ora) - Elegant terminal spinner.
- [unsplash](https://unsplash.com/) - Free [do whatever you want](https://unsplash.com/license) high-resolution photos.
- [wallpaper](https://github.com/sindresorhus/wallpaper) - Get or set the desktop wallpaper.
- [simple-download](https://github.com/rawnly/simple-download) - Simple nodeJS Downloader

<h5 align="center">
Made with a  ⌨️   in 🇮🇹
</h5>

[latest]: https://github.com/rawnly/splash-cli/releases/latest
[npm-url]: https://npmjs.org/package/splash-cli
[downloads-image]: http://img.shields.io/npm/dm/splash-cli.svg
[npm-image]: http://img.shields.io/npm/v/splash-cli.svg
