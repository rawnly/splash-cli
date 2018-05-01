require("babel-polyfill");

import fs from "fs";
import path from "path";
import { userInfo, homedir } from "os";

import Conf from "conf";
import chalk from "chalk";
import mkdirp from "mkdirp";
import frun from "first-run";
import updateNotifier from "update-notifier";
import printBlock from "@splash-cli/print-block";

import { defaultSettings, commandsList, keys } from "./extra/config";
import {
  clearSettings,
  downloadFlags,
  repeatChar,
  isPath
} from "./extra/utils";
import download from "./libs/download";
import actions from "./libs/commands/index";
import splash from "./libs/core";
import manifest from "../package.json";

const config = new Conf();

export default async (commands, flags, cliMode = false) => {
  const [command, ...subCommands] = commands;
  const { quiet, save } = flags;

  const options = {};

  // Parse commands
  for (let i = 0; i < subCommands.length; i += 1) {
    options[subCommands[i]] = subCommands[i];
  }

  // Shh!
  if (quiet) {
    console.log = () => {};
  }

  // Create the setting of the dir if not exists
  if (!config.get("directory") || !config.has("directory")) {
    config.set("directory", defaultSettings.directory);
  }

  // Check for ~/Pictures/splash_photos
  if (!fs.existsSync(config.get("directory"))) {
    mkdirp(config.get("directory"));
  }

  if (cliMode === true) {
    // CHECKS FOR UPDATES
    updateNotifier({
      pkg: manifest,
      updateCheckInterval: 1000 * 30
    }).notify();
  }

  if (flags.token) {
    config.set("token", flags.token);
  }

  if (!config.get("token") || !config.has("token")) {
    if (process.env.SPLASH_TOKEN) {
      config.set("token", SPLASH_TOKEN);
    } else {
      const token = await keys.api.getToken();
      config.set("token", token);
    }
  }

  // Check if is the first run after install
  if (frun()) {
    const settingsCleared = await clearSettings();

    printBlock(
      chalk`Welcome to ${manifest.name}@${manifest.version} {bold @${
        userInfo().username
      }}`,
      chalk`{bold Go make something awesome!}`,
      chalk`{dim Initials setup done.}`
    );

    return;
  }

  // Check for commands
  if (command) {
    if (cliMode === true) {
      const cmd = commandsList[command];

      if (cmd !== undefined && actions[cmd]) {
        actions[cmd](options, flags);
      } else if (cmd === "restore") {
        // Clear settings
        await clearSettings();

        // Clear first-run
        frun.clear();
        fs.unlinkSync(config.path);

        printBlock(chalk`{bold {green Settings Restored!}}`);
      } else if (cmd === "get-settings") {
        printBlock(chalk`{bold Settings}:`);
        console.log(
          chalk`{yellow -> {bold Settings path}}: {dim {underline ${
            config.path
          }}}`
        );

        const currentSettings = Object.keys(config.get());
        for (let i = 0; i < currentSettings.length; i += 1) {
          const setting = currentSettings[i];
          let settingValue = config.get(setting);

          if (setting === "token") {
            settingValue = repeatChar("*", settingValue.length);
          } else if (setting !== "pic-of-the-day") {
            if (isPath(settingValue)) {
              settingValue = chalk`{dim {underline ${settingValue}}}`;
            } else if (typeof settingValue === "object") {
              settingValue = JSON.stringify(settingValue, null, 2);
              settingValue = chalk`{dim ${settingValue}}`;
            } else {
              settingValue = chalk`{dim ${settingValue}}`;
            }

            console.log(chalk`{yellow -> {bold ${setting}}}:`, settingValue);
          }
        }
      } else {
        printBlock(
          chalk`{red Invalid command}: "{underline ${command}}"`,
          chalk`{green $} {yellow splash --help}`
        );
        process.exit();
      }
    } else {
      printBlock(
        chalk`{bold !!!} - Sorry, this feature is not avaiable as module.`
      );
      return false;
    }
  } else if (flags.token) {
    // Run splash
    let token =
      flags.token ||
      process.env.SPLASH_TOKEN ||
      config.get("token") ||
      config.get("token");

    if (!token) {
      keys.api.getToken().then(t => {
        config.set("token", t);
      });
    }
  } else {
    let token =
      flags.token ||
      process.env.SPLASH_TOKEN ||
      config.get("token") ||
      config.get("token");
    const url = await downloadFlags(
      `${keys.api.base}/photos/random?client_id=${token}`,
      flags
    );
    const response = await splash(url, flags);
    const photo = response.data;
    const { statusCode } = response.status;
    const setAsWallpaper = save ? false : true;
    if (statusCode === 200) {
      download(flags, { photo }, setAsWallpaper);
      return true;
    }

    return true;
  }

  return true;
};
