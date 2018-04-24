require('babel-polyfill');

import fs from 'fs';
import path from 'path';

import Conf from 'conf';
import chalk from 'chalk';
import mkdirp from 'mkdirp';
import frun from 'first-run';
import updateNotifier from 'update-notifier';
import printBlock from '@splash-cli/print-block';


import {
  defaultSettings,
  commandsList,
  keys
} from './extra/config';
import {
  clearSettings,
  downloadFlags
} from './extra/utils';
import download from './libs/download';
import actions from './libs/commands/index';
import splash from './libs/core';
import manifest from '../package.json';

const config = new Conf();

export default async (commands, flags, cliMode = false) => {
  const [command, ...subCommands] = commands;
  const {
    quiet,
    save
  } = flags;
  const options = {};

  // Parse commands
  for (let i = 0; i < subCommands.length; i += 1) {
    options[subCommands[i]] = subCommands[i];
  }

  // Shh!
  if (quiet) {
    console.log = () => {};
  }

  // Check if is the first run after install
  if (frun()) {
    clearSettings();
  }

  // Create the setting of the dir if not exists
  if (!config.get('directory') || !config.has('directory')) {
    config.set('directory', defaultSettings.directory);
  }

  // Check for ~/Pictures/splash_photos
  if (!fs.existsSync(config.get('directory'))) {
    mkdirp(config.get('directory'));
  }

  if (cliMode === true) {
    // CHECKS FOR UPDATES
    updateNotifier({
      pkg: manifest,
      updateCheckInterval: 1000 * 30,
    }).notify();
  }

  keys.api.getToken().then(token => {
    config.set('splash-token', token)
  })

  // Check for commands
  if (command) {
    if (cliMode === true) {
      const cmd = commandsList[command];

      if (cmd !== undefined && actions[cmd]) {
        actions[cmd](options, flags);
      } else if (cmd === 'restore') {
        // Clear settings
        clearSettings(config);

        // Clear first-run
        frun.clear();

        printBlock(chalk `{bold {green Settings Restored!}}`);
      } else if (cmd === 'get-settings') {
        printBlock(chalk `{bold Settings}:`);
        const currentSettings = Object.keys(config.get());
        for (let i = 0; i < currentSettings.length; i += 1) {
          const setting = currentSettings[i];
          console.log(chalk `{yellow -> {bold ${setting}}}:`, config.get(setting));
        }
      } else {
        printBlock(chalk `{red Invalid command}: "{underline ${command}}"`);
        process.exit();
      }
    } else {
      printBlock(chalk `{bold !!!} - Sorry, this feature is not avaiable as module.`)
      return false;
    }
  } else {
    // Run splash
    const url = await downloadFlags(`${keys.api.base}/photos/random?client_id=${config.get('splash-token')}`, flags);
    const response = await splash(url, flags);
    const photo = response.data;
    const { 
      statusCode
    } = response.status;
    const setAsWallpaper = save ? false : true;
    if (statusCode === 200) {
      download(flags, {
        photo
      }, setAsWallpaper);

      return true;
    }

    return true;
  }

  return true;
};