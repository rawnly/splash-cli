# Changelog
- 2.3.5 ([**Latest**][latest])
	* Fixed #11 
	
- 2.3.4 
	* Added `--theme` for macOs users, this flag will change the macOs theme by the background brightness
	
- 2.1.0 
	* Added `--collection <id>` download parameter
	* Added `--width <width>`& `--heigth <heigth>` download parameter ( **Experimental function** maybe is not working )
	* Added `--featured` download parameter (download a photo from featured photos)
	* Fixed some typos

- 2.0.0
	* Removed `commander.js`
	* Added `meow`
	* Better **folder tree**
	* Better **AutoUpdate**

- 1.8.0
	* Better `--dir` & `--save` directories management.
	* Added [`conf`](https://github.com/sindresorhus/conf) module
	* Added `--update`
	* Added `--restore`, its restore settings to defaults
	* Removed `.prefs` and `data.json` files.

- 1.7.2
	* Replaced [`request`](https://github/request/request) module with [`got`](https://github.com/sindresorhus/got) module
	* Implemented `--dir` option
	* Implemented `--set` option to `--save` flag

- 1.7.0
	* Fixed and replaced the `--download` with `--save` flag

- 1.6.x
	* Removed `--download` flag

- 1.5.x
	* Implemented the `--list` flag
	* Implemented the `--export` option for `--list` flag

- 1.4.x
	* EsLint Support

- 1.3.x
	* Auto Update with [`update-notifier`](https://github,com/sindresorhus/updupdate-notifier)

[latest]: https://github.com/rawnly/splash-cli/releases/latest
