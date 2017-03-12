# Splash
[![Downloads][downloads]][npm-url] [![Build Status](https://travis-ci.org/Rawnly/splash-cli.svg?branch=master)](build_url)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](xo_url)

Get beautiful wallpapers from [unsplash](unsplash)



![screen](https://cloud.githubusercontent.com/assets/16429579/21467810/3f37f348-c9fa-11e6-9c6a-82fa8364f5e6.png)
> The terminal shown above is [Hyper](hyper), with [hyper-sierra-vibrancy](hyper-sierra-vibrancy) as the terminal theme, and the [**oh-my-zsh**](oh-my-zsh) shell with `hyperzsh` **ZSH-THEME** as the theme.

## Installation
To install `splash-cli` you must use a **node package manager** such as [yarn](yarn) or [npm](npm).

```bash
	$ [sudo] npm i -g splash-cli #or yarn
```

## Usage
![usage](https://cloud.githubusercontent.com/assets/11269635/21428079/7b24cc80-c858-11e6-8dc3-2e164d23804a.gif)

To learn how to use **Splash** type `splash --help` into your terminal after installation, also you can read [the docs here](docs/FEATURES.md) or the basic version below.

### Flags
### `--id`
> Parameter

Pick a photo from the `id` or the `url`
```bash
  $ splash --id <id|url>
```
Input: `Yes`<br>

Type: `String`<br>

Default: `none`

### `save`
> Subcommand

Save a photo without set it as wallpaper.
```bash
  $ splash save 
  $ splash save --dest [path] #or -d
  $ splash save --set #or -s
```
**`REMEMBER`**: The path is relative to your position. So if you are in `~/Desktop` and you have setted `.` as path, it will save the photo in `~/Desktop`.

Input: `Yes`<br>

Type: `String`<br>

Default: `~/Pictures/splash_photos`

### `dir`
Set default download directory for pictures.

```bash
  $ splash dir [--flags] 

  $ splash dir --set [path] #or -s
```

If no `path` it will returns the active `path`.

Input: `Yes`<br>

Type: `String`<br>

Default: `~/Pictures/splash_photos`

### `--theme`
With this flag `splash` will detect the photo's brightness and toggle the **macOS** `dark-mode`.
```bash
  $ splash --theme
  $ splash -t 
```

![theme](https://cloud.githubusercontent.com/assets/16429579/23823903/7dcdba94-066c-11e7-9dc4-23cf338c80f5.png)


Platform: `darwin`<br>

Input: `none`<br>

Type: `Boolean`<br>

Default: `false`



## Related
- [Unsplash](https://unsplash.com/) - Free [do whatever you want](https://unsplash.com/license) high-resolution photos.



<br>
-
I hope you enjoyed this project, if you, drop a :star: ! It's free!  




[latest]: https://github.com/rawnly/splash-cli/releases/latest
[npm-url]: https://npmjs.org/package/splash-cli
[downloads]:http://img.shields.io/npm/dm/splash-cli.svg
[npm-image]: http://img.shields.io/npm/v/splash-cli.svg
[unsplash]: http://unsplash.com
[hyper]: https://hyper.is
[hyper-sierra-vibrancy]: https://npmjs.org/package/hyper-sierra-vibrancy
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[yarn]: https://github.com/yarnpkg/yarn
[npm]: https://npmjs.org
[build_badge]: https://travis-ci.org/Rawnly/splash-cli.svg?branch=master
[build_url]: https://travis-ci.org/Rawnly/splash-cli
[xo_badge]: https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo_url]: https://github.com/sindresorhus/xo
