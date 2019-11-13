<p align="center">
	<a href="https://www.producthunt.com/posts/splash-cli?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-splash-cli" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=136902&theme=dark" alt="Splash CLI - Beautiful wallpapers from Unsplash in your terminal 🖼️🛠️ | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px" /></a>
	&nbsp;&nbsp;&nbsp;
	<a href="https://www.producthunt.com/posts/splash-cli?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-splash-cli" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=136902&theme=dark&period=daily" alt="Splash CLI - Beautiful wallpapers from Unsplash in your terminal 🖼️🛠️ | Product Hunt Embed" style="width: 250px; height: 54px;" width="250px" height="54px" /></a>
</p>
<p align="center">
  <!-- <img src="https://img.shields.io/npm/dt/splash-cli.svg?style=for-the-badge" alt="Downloads" /> -->
  <img alt="npm" src="https://img.shields.io/npm/dm/splash-cli.svg?style=for-the-badge">
  <img src="https://img.shields.io/github/package-json/v/splash-cli/splash-cli.svg?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/travis/splash-cli/splash-cli/master.svg?style=for-the-badge" alt="Travis CI" />
	<br />
  <img alt="Website" src="https://img.shields.io/website/https/splash-cli.app.svg?down_color=red&style=for-the-badge">
  <img alt="GitHub issues" src="https://img.shields.io/github/issues/splash-cli/splash-cli.svg?style=for-the-badge">
</p>
<br>

<h1 align="center"> Splash CLI </h1>
<h6 align="center">Get stunning wallpapers from <a href="https://unsplash.com">Unsplash</a> </h6>
<hr />

**Splash CLI** is an [**Unsplash**][uwebsite] client powered by _NodeJS_.
You can use it as an Unsplash terminal client, for example you can:

- Change wallpaper on your desktop
- Like or download photos.
- Create new collections
- Edit collections

- ~Upload photos~ (See [#47](https://github.com/splash-cli/splash-cli/issues/47))

---

<h6 align="center"> <a href="https://github.com/rawnly/dot-files">Terminal Setup</a> </h6>
<p align="center">
	<a href="https://splash-cli.app" title="Splash CLI">
		<img src="https://user-images.githubusercontent.com/16429579/46895514-07154800-ce79-11e8-9e1c-0df66a38a915.gif" />
	</a>
</p>

> :eyes: [**Looking for mainteiners!**][mailtome] :eyes:

<!-- > Get beautiful wallpapers from [**Unsplash**][uwebsite] -->

## :floppy_disk: Installation

To install `splash-cli` you must use a **node package manager** such as [yarn](https://yarnpkg.com) or [npm](https://npmjs.com).

```bash
	# With NPM
	$ npm install --global splash-cli

	# With Yarn
	$ yarn global add splash-cli
```

## ❓ [FAQs](/documentation/FAQ.md)

A list of **Frequently Asked Questions** (FAQ) can be found [**here**](https://github.com/splash-cli/splash-cli/issues?utf8=✓&q=is%3Aissue+label%3A%22%3Aquestion%3A++FAQ%22+)

#### - What is **Splash CLI**?

> Splash CLI is an **Unsplash** client powered by _NodeJS_.
>
> You can use it to:
>
> - Change wallpaper on your desktop.
> - Create new collections (soon)
> - Like or download photos.
> - Download photos by ID.
> - Pick random photo from an user or a collection.

#### - Why did you make it?

> When I wrote **Splash CLI** it was just for fun, I never tought that someone could find this tool so useful/funny 😅

## :paw_prints: Usage

> Splash is easy and quick to use, just run `splash` to get started.

```

  Get beautiful wallpapers from unsplash.

  Usage [v3.4.6]

  	$ splash [command] [flags]

  Commands
  	settings <get|set|restore>	GET/SET/RESTORE SETTINGS
  	alias <get|set|remove>		GET/SET COLLECTION ALIASES
  	collection <get|delete>		MANAGE COLLECTIONS
  	dir <clean|get|count>		MANAGE THE DOWNLOAD DIRECTORY
  	user <login|logout|get|...> 	MANAGE USER LOGIN/LOGOUT - GET USER INFOS
  	-------------------------------------------------------------------------
  	HINT: use `[command] help` for the list of all options

  Options
  	-h --help			THIS MESSAGE
  	-v --version			v3.4.6

  	--scale <auto|fill|fit|stretch|center>  SET WALLPAPER SCALE
  	--screen <all|main|monitor number>	SET AS WALLPAPER ON SELECTED MONITOR
  	--orientation <landscape|portrait|squarish> SET WALLPAPER ORIENTATION (DEFAULT: 'landscape')

  	-s --save [optional_path] 	DOWNLOAD WITHOUT SETTING AS WALLPAPER
  	--set <path> 			SET GIVEN PHOTO AS WALLPAPER

  	-i --info			SHOW EXIF
  	-q --quiet			NO OUTPUT


  Source Filters
  	-c --curated			RANDOM CURATED PHOTO
  	-u --user <username>		RANDOM PHOTO FROM PROVIDED USER

  	--day				GET THE PHOTO OF THE DAY
  	--id <id or url>		PHOTO BY ID
  	--collection <id or alias>	RANDOM PHOTO FROM PROVIDED COLLECTION

  Search Filters
  	-f --featured			LIMIT TO ONLY FEATURED PHOTOS
  	--query <query>			RANDOM FROM QUERY


```

## Suggested Collections

- **Editorial** ([**317099**](https://unsplash.com/collections/317099/unsplash-editorial)) - A collection of beautiful photos, curated by the Unsplash Team.

- **Wallpapers** ([**1065976**](https://unsplash.com/collections/1065976/wallpapers)) - Free stunning HD wallpapers for your mobile and desktop screens.

- **Textures & Patterns** ([**3330445**](https://unsplash.com/collections/3330445/textures-patterns)) - Find your next perfect texture or pattern in high-quality.

---

## Contributors

List of awesome people that have helped to keep this project alive:

- [mohnjatthews](http://github.com/mohnjatthews)
- [alecrust](http://github.com/alecrust)

### How can I contribute?

Hi thank you for the interest! [Here](/.github/CONTRIBUTING.md) you can find all what you need to know about and [here](/documentation/ROADMAP.md) you can find some things that I'd like to improve.

## :space_invader: Related Stuff

- [Splash CLI Website](https://splash-cli.app) &mdash; Powered by [`Next.js`](https://nextjs.org) you can take a look at the code [here](https://github.com/splash-cli/splash-cli-website/).
- 🔥[StockPapers][stockpapers] 🔥 &mdash; Looking for mobile wallpapers? [StockPapers][stockpapers] is the solution!
- [Unsplash](https://unsplash.com/) &mdash; Free [do whatever you want](https://unsplash.com/license) high-resolution photos.
- [Collections Downloader](https://github.com/Rawnly/collection-downloader-py) &mdash; Download **Unsplash** collections (_written in Python_)

---

<p align="center">
	Made with love by <a href="https://fedevitale.dev"> Federico Vitale </a> in :it:
</p>

<p align="center">
	<a href="https://twitter.com/rawnlydev"> Twitter </a>
	-
	<a href="https://splash-cli.app"> Official Website </a>
	-
	<a href="https://instagram.com/fedevitale.dev"> Instagram </a>
</p>

[uwebsite]: https://unsplash.com
[desk]: https://github.com/rawnly/splashdesktop
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[hyper]: https://github.com/zeit/hyper
[splash-site]: https://splash-cli.app
[old-branch]: https://github.com/rawnly/splash-cli/tree/node%3C%3D7
[sample]: https://i.imgur.com/o0eXz6F.gif
[help]: https://user-images.githubusercontent.com/16429579/33238956-68de7c6a-d298-11e7-841d-2da1c624fce8.png
[stockpapers]: https://itunes.apple.com/us/app/stock-papers/id1443861313
[mailtome]: mailto:fedevitale99@gmail.com?subject=Splash%20CLI%20%20Mainteniner
