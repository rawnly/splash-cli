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
  log(`Hello ${chalk.bold(user.toString())}, all photos are stored in ${chalk.yellow.underline(config.get('pic_dir'))}`);
  log('');
  log('');
  log(figlet.textSync('Splash'));
  log('');
  log('');
}

// Initializing
const cli = meow(`
  ${chalk.yellow.bold('# Usage')}
    $ splash [subcommands]  [--flags]

  ${chalk.yellow.bold('# Help')}
    -h --help                      ${chalk.gray('# Display this message')}
    -v --version                   ${chalk.gray('# Display splash version')}

    ${chalk.blue.bold('## Search options')}

      -u --user <username>         ${chalk.gray('# Pick random image from selected user')}
      -f --featured                ${chalk.gray('# Pick random image from featured photos')}
      -i --info                    ${chalk.gray('# Get EXIF infos and Photographer infos.')}

      --collection <collection_ID> ${chalk.gray('# Filter by collection')}
      --id <id | photo_url>        ${chalk.gray('# Get image by photo ID or URL.')}


    ${chalk.blue.bold('## Sub commands')}

      list [extra flags]          ${chalk.gray('# List of downloaded photos.')}
        --export                  ${chalk.gray('# Export the photo list [--list].')}

      save [path] [extra flags]  ${chalk.gray('# Save photo without setting it as wallpaper.')}
        -s --set                 ${chalk.gray('# Set the saved photo [--save] as wallpaper.')}
        -d --dest [path]

      dir                         ${chalk.gray('# Get the main download directory.')}
        -s --set [path]           ${chalk.gray('# Set the main download directory.')}
        
      update                      ${chalk.gray('# Update to latest version.')}
      clean                       ${chalk.gray('# Delete all downloaded photos.')}
      restore                     ${chalk.gray('# Restore settings to default.')}

      --offline <true|false>      ${chalk.gray('# Set as true if you are under proxy')}
      -p --progress                  ${chalk.gray('# Show progressbar during downloads')}
      -t --theme                     ${chalk.gray('# macOS Only! Set the dark theme if photo has low brightness')}`, {

        alias: {
          d: 'dest',
          p: 'progress',
          t: 'theme',
          i: 'info',
          w: 'width',
          h: 'heigth',
          f: 'featured',
          v: 'version',
          s: 'set'
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
