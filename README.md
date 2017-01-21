# Splash

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/df39aef5f5a14b62a8cf4701a7962c29)](https://www.codacy.com/app/fedevitale99/splash-cli?utm_source=github.com&utm_medium=referral&utm_content=Rawnly/splash-cli&utm_campaign=badger)
[![Downloads][downloads-image]][npm-url]
![version](https://img.shields.io/badge/version-1.4.0-brightgreen.svg)
[![Build Status](https://travis-ci.org/Rawnly/splash-cli.svg?branch=master)](https://travis-ci.org/Rawnly/splash-cli)

---
#### <p align="center"> New Version! 1.7.0 ( <a href="mailto:https://npmjs.org/packages/splash-cli">Download Now</a> ) </p>
---

Set your wallpaper with beautiful photos from [unsplash](http://unsplash.com)

![screen](https://cloud.githubusercontent.com/assets/16429579/21467810/3f37f348-c9fa-11e6-9c6a-82fa8364f5e6.png)
> Got the same setup [here](http://github.com/Rawnly/dot-files)


## Installation

To install `splash-cli` you must use **npm** (as always) and do the following:

```bash
	$ npm i -g splash-cli
```

## Usage
![](https://cloud.githubusercontent.com/assets/11269635/21428079/7b24cc80-c858-11e6-8dc3-2e164d23804a.gif)
> All the photos are stored in the module directory

```bash
	$ splash
    # Start download random photo
    # and set it as wallpaper
```

## Options
- <h3> SAVE </h3>
Option: `--save [path]` <br>
Shortcut: `-s` <br>
<br>

Save the downloaded photo to a local folder if specified, or to the usually `~/Pictures/splash_photos`
```bash
	$ splash --save ~/Desktop
	# not ~/Desktop/
```

- <h3>INFO</h3>
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

- <h3> ID </h3>
Option: `--id <id>` <br>
Shortcut: `none` <br>
<br>
Get the image from **ID**. You can get the image id on the [unsplash website](https://unsplash.com) by opening an image and grabbing the **ID** from the url.

If you have ever downloaded the photo with **splash-cli** and it is in the `~/Pictures/splash_photos/` folder it will not be downloaded again.
```bash
	$ splash --id YJ9ygJAVzmO #no shortcut
```
> https://unsplash.com/?photo=`EXAMPLE_PHOTO_ID`

- <h3>CLEAN</h3>
Option: `--clean` <br>
Shortcut: `-c` <br>
<br>
Delete all downloaded photos.
```bash
	$ splash -c 		
```

- <h3>PATH</h3>
Option: `--path` <br>
Shortcut: `-p` <br>
<br>
Get the download path.
```bash
	$ splash -p 		
```

- <h3>Check</h3>
Option: `--check` <br>
Shortcut: `none` <br>
<br>
Check for updates.
```bash
	$ splash --check 		 
```

- <h3>List</h3>
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

## TODO
- [ ] Implement other flags.
- [x] ~Electron application.~
- [x] ~Update screenshots and gifs in this file.~

If you want give me some **help** read the [todo list](docs/todo.md) or [this](rawnly.github.io/splash-cli).

## Related
- [ora](https://github.com/sindresorhus/ora) - Elegant terminal spinner.
- [boxen](https://github.com/sindresorhus/boxen) - Create boxes in the terminal.
- [unsplash](https://unsplash.com/) - Free [do whatever you want](https://unsplash.com/license) high-resolution photos.
- [wallpaper](https://github.com/sindresorhus/wallpaper) - Get or set the desktop wallpaper.
- [simple-download](https://github.com/rawnly/simple-download) - Simple nodeJS Downloader

<h5 align="center">
Made with a  ⌨️   in 🇮🇹
</h5>


[npm-url]: https://npmjs.org/package/splash-cli
[downloads-image]: http://img.shields.io/npm/dm/splash-cli.svg
[npm-image]: http://img.shields.io/npm/v/splash-cli.svg
