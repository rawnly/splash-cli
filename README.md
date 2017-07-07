# Splash
> Looking for something easier? Check out the [desktop version][desk]

<br>

<!-- badges -->
[![Downloads](https://camo.githubusercontent.com/fbc124b0e8d924d7f302d6500451778e381f8b78/687474703a2f2f696d672e736869656c64732e696f2f6e706d2f646d2f73706c6173682d636c692e737667)](https://npmjs.org/package/splash-cli) [![Build Status](https://camo.githubusercontent.com/46ec4f1f708c9a91132c190fa0f8918dadeaa04a/68747470733a2f2f7472617669732d63692e6f72672f5261776e6c792f73706c6173682d636c692e7376673f6272616e63683d6d6173746572)](/Rawnly/splash-cli/blob/master/build_url)
<!-- /badges -->

![full-view](tmp-assets/full-view.png)
> #### Get beautiful wallpapers from [unsplash](uwebsite) 
> The terminal shown above is [Hyper][hyper], with a custom theme, and the [**oh-my-zsh**][oh-my-zsh] shell with `hyperzsh` **ZSH-THEME** as the theme.

<!-- # Backround
So the first questio that you can have could be: "_Why?_" then i can answer: "_Because it's cool download random wallpaper from [unsplash][uwebsite] and set it via cmd_" -->
# Install
To install `splash-cli` you must use a **node package manager** such as [yarn](/Rawnly/splash-cli/blob/master/yarn) or [npm](/Rawnly/splash-cli/blob/master/npm).
```bash
  $ sudo npm install --global splash-cli
  
  # or via yarn
  
  $ sudo yarn global add splash-cli
```
# Usage
![help-menu](tmp-assets/help-menu.png)
 
 Splash is easy and quick to use, just run `splash` to start.
 
 I have divided commands and flags in 2 categories:
 
 #### Picker parameters 
 - `-u --user <username>`: Pick random image from given user.
 - `-f --featured`: Pick random image from the _home_ of [unsplash][uwebsite].
 - `-i --info`: Return all the exif and shooter infos.
 - `--collection <collection id>`: Pick image from the selected collection.
 - `--id <id | pic_url>`: Download the given image.
 
 #### Subcommands and options
 - `list [extra sub-flags]`: return the list of downloaded photos.
   - `--export`: save the list to a json file.
- `save`:  Save the photo without set it as wallpaper.
    - `-s --set`: Set the saved photo as wallpaper.
    - `-d --dest`: Set the save directory _(Default: ~/Pictures/splash_photos)_
- `dir`: Return the default download path. _(Default: ~/Pictures/splash_photos)_
  - `-s --set`: Set the default download path.
- `update`: Download and install the latest **splash-cli** version.
- `clean`: Delete all downloaded photos.
- `restore`: Restore all settings to default.
- `-p --progress`: Show progressbar instead _"Making something awesome"_ while downloading photos.
 
 
## Related

*   [Unsplash](https://unsplash.com/) - Free [do whatever you want](https://unsplash.com/license) high-resolution photos.

##### I hope you enjoyed this project, if you, drop a <g-emoji alias="star" fallback-src="https://assets-cdn.github.com/images/icons/emoji/unicode/2b50.png" ios-version="6.0" title=":star:">⭐️</g-emoji> ! It's free!
 
[uwebsite]: https://unsplash.com
[desk]: https://github.com/rawnly/splashdesktop
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[hyper]: https://github.com/zeit/hyper