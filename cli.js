#!/usr/bin/env node

// Local
const download = require('./libs/download');
const updateCmd = require('./options/update');
const restoreCmd = require('./options/restore');
const dirCmd = require('./options/dir');
const listCmd = require('./options/list');
const saveCmd = require('./options/save');
const idCmd = require('./options/id');
const cleanCmd = require('./options/clean');

// Modules
const figlet = require('figlet');
const normalize = require('normalize-url');
const colors = require('colors');
const chalk = require('chalk');
const meow = require('meow');
const isOnline = require('is-online');
const updateNotifier = require('update-notifier');
const clear = require('clear');
const Conf = require('conf');
const firstRun = require('first-run');
const pkg = require('./package.json');
const splash = require('./libs/core');
const path = require('path');
const os = require('os');

// Variables
const log = console.log;
const join = path.join;
const home = os.homedir();
const user = home.split('/')[home.split('/').length - 1];
const config = new Conf();
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 });
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiUrl = normalize(`https://api.unsplash.com/photos/random?client_id=${token}`);

// Welcome Message
if (firstRun()) {
  clear();
  config.set('pic_dir', join(home, 'Pictures', 'splash_photos'));
  log(`Hello ${colors.bold(user.toString().capitalize())}, all photos are stored in ${colors.yellow.underline(config.get('pic_dir'))}`);
  log('');
  log('');
  log(figlet.textSync('Splash'));
  log('');
  log('');
}


// Initializing
const cli = meow(`
  ${colors.yellow.bold('# Usage')}
    $ splash [--flags]

  ${colors.yellow.bold('# Help')}
    ${colors.blue.bold('## Standard')}
    -h --help                          ${colors.gray('# Display this message')}
    -v --version                       ${colors.gray('# Display splash version')}

    ${colors.blue.bold('## Search options')}

      -u --user <username>             ${colors.gray('# Pick random image from selected user')}
      -f --featured                    ${colors.gray('# Pick random image from featured photos')}
      -w --width <px>                  ${colors.gray('# image width')}
      -h --heigth <px>                 ${colors.gray('# image height')}
      -i --info                        ${colors.gray('# Get EXIF infos and Photographer infos.')}

      --collection <collection_ID>     ${colors.gray('# Filter by collection')}
      --id <id | photo_url>            ${colors.gray('# Get image by photo ID or URL.')}


    ${colors.blue.bold('## Other commands')}

      -l --list [extra flags]          ${colors.gray('# List of downloaded photos.')}
      -s --save [path] [extra flags]   ${colors.gray('# Save photo without setting it as wallpaper.')}
      -d --dir [path]                  ${colors.gray('# Set the main download directory.')}
      -u --update                      ${colors.gray('# Update to latest version.')}
      -c --clean                       ${colors.gray('# Delete all downloaded photos.')}

      --progress                       ${colors.gray('# show progressbar during downloads')}
      --restore                        ${colors.gray('# Restore settings to default.')}
      --set                            ${colors.gray('# Set the saved photo [--save] as wallpaper.')}
      --theme                          ${colors.gray('# macOS Only! Set the dark theme if photo has low brightness')}
      --export                         ${colors.gray('# Export the photo list [--list].')}`, {

        alias: {
          l: 'list',
          c: 'clean',
          i: 'info',
          s: 'save',
          d: 'dir',
          u: 'update',
          w: 'width',
          h: 'heigth',
          f: 'featured',
          v: 'version',
        },
      });

// Main Function for meow
function sp(action, flags) {
  if (notifier.update) {
    if (flags.update) {
      updateCmd();
    } else {
      notifier.notify({
        message: `${chalk.dim(notifier.update.current)} -> ${chalk.green(notifier.update.latest)}` +
        `\n Run ${chalk.cyan('splash --update')} to update`,
        boxenOpts: {
          padding: 1,
          margin: 2,
          align: 'center',
          borderColor: 'yellow',
          borderStyle: 'double',
        },
      });
    }
  } else if (flags.restore) {
      // RESTORE
    restoreCmd();
  } else if (flags.update) {
      // UPDATE
    isOnline().then((value) => {
      if (value) {
        updateCmd();
      } else {
        log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (flags.clean) {
    // CLEAN
    cleanCmd();
  } else if (flags.list) {
    // LIST ( --EXPORT )
    listCmd(flags);
  } else if (flags.save) {
    // SAVE ( --set )
    isOnline().then((value) => {
      if (value) {
        saveCmd(flags);
      } else {
        log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (flags.id) {
    // ID
    isOnline().then((value) => {
      if (value) {
        idCmd(flags);
      } else {
        log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (flags.dir) {
    // Dir
    dirCmd(flags);
  } else {
    // Splash Classic
    isOnline().then((value) => {
      if (value) {
        let url = '';

        if (flags.heigth && flags.width) {
          url = `${apiUrl}&&w=${flags.width}&&h=${flags.heigth}`;
        } else if (flags.user) {
          url = `${apiUrl}&&username=${flags.user}`;
        } else if (flags.featured) {
          url = `${apiUrl}&&featured=${flags.featured}`;
        } else if (flags.collection) {
          url = `${apiUrl}&&collection=${flags.collection}`;
        } else {
          url = `${apiUrl}`;
        }

        splash(url, (photo) => {
          download(join(config.get('pic_dir'), `${photo.id}.jpg`), photo, flags);
        });
      } else {
        log(`${colors.yellow('Splash:')} I need an internet connection!`);
        process.exit();
      }
    });
  }
}

// Call the main function
sp(cli.input[0], cli.flags);
