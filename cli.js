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
const sizeCmd = require('./options/size');

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
  log(`Hello ${chalk.bold(user.toString())}, all photos are stored in ${chalk.yellow.underline(config.get('pic_dir'))}`);
  log('');
  log('');
  log(figlet.textSync('Splash'));
  log('');
  log('');
}

// Initializing
const cli = meow(`

    USAGE: ${chalk.yellow('splash')} ${chalk.gray('[subcommand]  [--flags]')}


    ${chalk.yellow('-h --help')}                          ${chalk.gray('# Display this message')}
    ${chalk.yellow('-v --version')}                       ${chalk.gray('# Display splash version')}

    ${chalk.blue('Picker parameters')}

      ${chalk.yellow('-u --user')} ${chalk.gray('<username>')}             ${chalk.gray('# Pick random image from selected user')}
      ${chalk.yellow('-f --featured')}                    ${chalk.gray('# Pick random image from featured photos')}
      ${chalk.yellow('--size')} ${chalk.gray('[es: 1920x1080]')}           ${chalk.gray('# Resize the image')}

      ${chalk.yellow('-i --info')}                        ${chalk.gray('# Get EXIF infos and Photographer infos')}

      ${chalk.yellow('--collection')} ${chalk.gray('<collection_ID>')}     ${chalk.gray('# Filter by collection')}
      ${chalk.yellow('--id')} ${chalk.gray('<id | photo_url>')}            ${chalk.gray('# Get image by photo ID or URL')}


    ${chalk.blue('Commands')}

      ${chalk.yellow.bold('list')} ${chalk.gray('[extra flags]')}          ${chalk.gray('# List of downloaded photos.')}
        ${chalk.yellow('--export')}                       ${chalk.gray('# Export the photo list.')}

      ${chalk.yellow.bold('save')} ${chalk.gray('[extra flags]')}          ${chalk.gray('# Save photo without setting it as wallpaper.')}
        ${chalk.yellow('-s --set')}                       ${chalk.gray('# Set the saved photo as wallpaper.')}
        ${chalk.yellow('-d --dest')} ${chalk.gray('[path]')}               ${chalk.gray('# Set the path for saved photos (Default: ~/Pictures/splash_photos)')}

      ${chalk.yellow.bold('dir')}                         ${chalk.gray('# Get the main download directory.')}
        ${chalk.yellow('-s --set')} ${chalk.gray('[path]')}                ${chalk.gray('# Set the main download directory.')}

      ${chalk.yellow.bold('update')}                      ${chalk.gray('# Update to the latest version.')}
      ${chalk.yellow.bold('clean')}                       ${chalk.gray('# Delete all downloaded photos.')}
      ${chalk.yellow.bold('restore')}                     ${chalk.gray('# Restore settings to default.')}


      ${chalk.yellow('--offline')} ${chalk.gray('<true|false>')}           ${chalk.gray('# Set as true if you are under proxy (Default: false)')}
      ${chalk.yellow('-p --progress')}                    ${chalk.gray('# Show progressbar during downloads (Default: false)')}
      ${chalk.yellow('-t --theme')}                       ${chalk.gray('# macOS Only! Set the the theme base on color brightness')}`, {

        alias: {
          d: 'dest',
          p: 'progress',
          t: 'theme',
          i: 'info',
          f: 'featured',
          v: 'version',
          s: 'set',
          h: 'help',
          u: 'user'
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
          borderColor: 'green',
          borderStyle: 'single'
        }
      });
    }
  } else if (action === 'restore') {
      // RESTORE
    restoreCmd();
  } else if (action === 'update') {
      // UPDATE
    isOnline().then(value => {
      if (value || config.get('proxy')) {
        updateCmd();
      } else {
        log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (action === 'clean') {
    cleanCmd();
  } else if (action === 'list') {
    listCmd(flags);
  } else if (action === 'save') {
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
  } else if (flags.size) {
    isOnline().then(value => {
      if (value || config.get('proxy')) {
        sizeCmd(flags);
      } else {
        console.log('I need an internet connection!');
        process.exit();
      }
    });
  } else if (action === 'dir') {
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

        if (flags.user) {
          url = `${apiUrl}&username=${flags.user}`;
        } else if (flags.featured) {
          url = `${apiUrl}&featured=${flags.featured}`;
        } else if (flags.collection) {
          url = `${apiUrl}&collection=${flags.collection}`;
        } else {
          url = `${apiUrl}`;
        }

        splash(url, photo => {
          download({
            filename: join(config.get('pic_dir'), `${photo.id}.jpg`),
            photo
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
