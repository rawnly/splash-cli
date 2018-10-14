<p align="center">
  <img src="https://img.shields.io/npm/dt/splash-cli.svg?style=for-the-badge" alt="Downloads" />
  <img src="https://img.shields.io/github/package-json/v/splash-cli/splash-cli.svg?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/travis/splash-cli/splash-cli/master.svg?style=for-the-badge" alt="Travis CI" />
</p>

<br>

# Splash CLI
<p align="center">
	<a href="https://splash-cli.now.sh" title="Splash CLI">
		<img src="https://user-images.githubusercontent.com/16429579/46895514-07154800-ce79-11e8-9e1c-0df66a38a915.gif" />
	</a>
</p>

> Get beautiful wallpapers from [**Unsplash**](uwebsite)

## :floppy_disk: Installation

To install `splash-cli` you must use a **node package manager** such as [yarn](https://yarnpkg.com) or [npm](https://npmjs.com).

```bash
	# With NPM
	$ npm install --global splash-cli

	# With Yarn
	$ yarn global add splash-cli
```

## :paw_prints: Usage
> Splash is easy and quick to use, just run `splash` to get started.

```	
  $ splash [command] [flags]

  Commands
  	settings <get|set|restore>	GET/SET/RESTORE SETTINGS
  	alias <get|set|remove>			GET/SET COLLECTION ALIASES

  Options
  	-h --help			    THIS MESSAGE
  	-v --version			3.0.1

    ** MACOS ONLY **
  	--scale <auto|fill|fit|stretch|center>    SET WALLPAPER SCALE
  	--screen <all|main|monitor number>    	  SET AS WALLPAPER ON SELECTED MONITOR

  	-s --save [optional_path] 	              DOWNLOAD WITHOUT SETTING AS WALLPAPER

  	-i --info			  SHOW EXIF
  	-q --quiet			NO OUTPUT


  Source Filters
  	-u --user <username>		  RANDOM PHOTO FROM PROVIDED USER
  	--collection <id|alias>		RANDOM PHOTO FROM PROVIDED COLLECTION
  	-c --curated			        RANDOM CURATED PHOTO
  	--id <id|url>			        PHOTO BY ID
  	--day				              GET THE PHOTO OF THE DAY
	
  Search Filters
  	-f --featured			  LIMIT TO ONLY FEATURED PHOTOS
  	--query <query>			RANDOM FROM QUERY
```

### Usage as module
#### splash([flags])
##### flags
All the **CLI** flags/options (no commands, such as `settings` or `aliases`).

```js
  import splash from 'splash-cli';

  splash({ quiet: true, screen: 'main', collection: 317099 })
```

<!--
## Contributors
List of awesome people that have helped to keep this project alive:

* [mohnjatthews](http://github.com/mohnjatthews)
* [alecrust](http://github.com/alecrust)
-->

## :space_invader: Related
* [Unsplash](https://unsplash.com/) - Free [do whatever you want](https://unsplash.com/license) high-resolution photos.
* [Download Collections](https://github.com/Rawnly/collection-downloader-py) - Download **Unsplash** collections (*written in Python*)

---

<p align="center">
	<a href="https://splash-cli-now.sh"> Official Website </a>
	-
	<a href="https://twitter.com/rawnlydev"> Twitter </a>
	-
	<a href="https://instagram.com/fede.vitale"> Instagram </a>
</p>

[uwebsite]: https://unsplash.com
[desk]: https://github.com/rawnly/splashdesktop
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[hyper]: https://github.com/zeit/hyper
[old-branch]: https://github.com/rawnly/splash-cli/tree/node%3C%3D7
[sample]: https://i.imgur.com/o0eXz6F.gif
[help]: https://user-images.githubusercontent.com/16429579/33238956-68de7c6a-d298-11e7-841d-2da1c624fce8.png
