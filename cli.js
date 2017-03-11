#!/usr/bin/env node

// Modules
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const meow = require('meow');
const isOnline = require('is-online');
const updateNotifier = require('update-notifier');
const clear = require('clear');
const Conf = require('conf');
const firstRun = require('first-run');
const figlet = require('figlet');
const normalize = require('normalize-url');

// Local
const splash = require('./libs/core');
const pkg = require('./package.json');
const download = require('./libs/download');
const updateCmd = require('./options/update');
const restoreCmd = require('./options/restore');
const dirCmd = require('./options/dir');
const listCmd = require('./options/list');
const saveCmd = require('./options/save');
const idCmd = require('./options/id');
const cleanCmd = require('./options/clean');

// Variables
const log = console.log;
const join = path.join;
const home = os.homedir();
const user = home.split('/')[home.split('/').length - 1];
const config = new Conf();
const notifier = updateNotifier({pkg, updateCheckInterval: 1000});
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiUrl = normalize(`https://api.unsplash.com/photos/random?client_id=${token}`);

// Welcome Message
if (firstRun()) {
  clear();
  config.set('proxy', false);
  config.set('pic_dir', join(home, 'Pictures', 'splash_photos'));
  log(`Hello ${chalk.bold(user.toString().capitalize())}, all photos are stored in ${chalk.yellow.underline(config.get('pic_dir'))}`);
  log('');
  log('');
  log(figlet.textSync('Splash'));
  log('');
  log('');
}

// Initializing
const cli = meow(`
  ${chalk.yellow.bold('# Usage')}
    $ splash [--flags]

  ${chalk.yellow.bold('# Help')}
    ${chalk.blue.bold('## Standard')}
    -h --help                          ${chalk.gray('# Display this message')}
    -v --version                       ${chalk.gray('# Display splash version')}

    ${chalk.blue.bold('## Search options')}

      -u --user <username>             ${chalk.gray('# Pick random image from selected user')}
      -f --featured                    ${chalk.gray('# Pick random image from featured photos')}
      -w --width <px>                  ${chalk.gray('# Image width')}
      -h --heigth <px>                 ${chalk.gray('# Image height')}
      -i --info                        ${chalk.gray('# Get EXIF infos and Photographer infos.')}

      --collection <collection_ID>     ${chalk.gray('# Filter by collection')}
      --id <id | photo_url>            ${chalk.gray('# Get image by photo ID or URL.')}


    ${chalk.blue.bold('## Other commands')}

      -l --list [extra flags]          ${chalk.gray('# List of downloaded photos.')}
      -s --save [path] [extra flags]   ${chalk.gray('# Save photo without setting it as wallpaper.')}
      -d --dir [path]                  ${chalk.gray('# Set the main download directory.')}
      -u --update                      ${chalk.gray('# Update to latest version.')}
      -c --clean                       ${chalk.gray('# Delete all downloaded photos.')}

      --offline <true|false>            ${chalk.gray('# Set as true if you are under proxy')}
      --progress                       ${chalk.gray('# Show progressbar during downloads')}
      --restore                        ${chalk.gray('# Restore settings to default.')}
      --set                            ${chalk.gray('# Set the saved photo [--save] as wallpaper.')}
      --theme                          ${chalk.gray('# macOS Only! Set the dark theme if photo has low brightness')}
      --export                         ${chalk.gray('# Export the photo list [--list].')}`, {

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
          v: 'version'
        }
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
          borderStyle: 'double'
        }
      });
    }
  } else if (flags.restore) {
      // RESTORE
    restoreCmd();
  } else if (flags.update) {
      // UPDATE
    isOnline().then(value => {
      if (value || config.get('proxy')) {
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
    isOnline().then(value => {
      if (value || config.get('proxy')) {
        saveCmd(flags);
      } else {
        log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (flags.id) {
    // ID
    isOnline().then(value => {
      if (value || config.get('proxy')) {
        idCmd(flags);
      } else {
        log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (flags.dir) {
    // Dir
    dirCmd(flags);
  } else if (flags.offline) {
    config.set('proxy', flags.offline);
    console.log(`Proxy: ${config.get('proxy')}`);
  } else {
    // Splash Classic
    isOnline().then(value => {
      if (value || config.get('proxy')) {
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

        splash(url, photo => {
          download({
            filename: join(config.get('pic_dir'), `${photo.id}.jpg`),
            photo: photo
          }, flags);
        });
      } else {
        log(`${chalk.yellow('Splash:')} I need an internet connection!`);
        console.log();
        console.log(`Proxy Status: ${config.get('proxy')}`);
        console.log();
        console.log(`If you are under a ${chalk.bold('proxy')} server, check who '--offline' option is on true.`);
        process.exit();
      }
    });
  }
}

// Call the main function
sp(cli.input[0], cli.flags);
