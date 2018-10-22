require("babel-polyfill");

import isMonth from "@splash-cli/is-month";
import parseID from "@splash-cli/parse-unsplash-id";
import pathFixer from "@splash-cli/path-fixer";
import printBlock from "@splash-cli/print-block";
import chalk from "chalk";
import clear from "clear";
import Conf from "conf";
import frun from "first-run";
import fs from "fs";
import randomFrom from "lodash/sample";
import mkdirp from "mkdirp";
import Ora from "ora";
import { userInfo } from "os";
import updateNotifier from "update-notifier";
import fetch from 'isomorphic-fetch';

import manifest from "../package.json";
import commands from "./commands/index";

import { defaultSettings, unsplash } from "./extra/config";
import { clearSettings, download, errorHandler, parseCollection, picOfTheDay, login, updateMe } from "./extra/utils";

const config = new Conf({
  defaults: defaultSettings
});

const {
  photos: {
    getRandomPhoto,
    getPhoto,
    listCuratedPhotos,
    downloadPhoto
  },
  collections: {
    getCollection,
    getCuratedCollection,
    getCollectionPhotos,
    getCuratedCollectionPhotos
  },
  currentUser: user
} = unsplash;

const spinner = new Ora({
  color: "yellow",
  spinner: isMonth("december") ? "christmas" : "earth"
});

export default async function (input, flags) {
  const [command, ...subCommands] = input;
  const { quiet, save } = flags;
  const options = {};

  // Parse commands
  for (let i = 0; i < subCommands.length; i += 1) {
    options[subCommands[i]] = subCommands[i];
  }


  if (flags.quiet) {
    console.log = console.info = () => {};
    spinner.start = spinner.fail = () => {};
  }

  if (!config.get("directory") || !config.has("directory")) {
    config.set("directory", pathFixer("~/Pictures/splash_photos"));
  }

  if (fs.existsSync(config.get("directory"))) {
    mkdirp(config.get("directory"), error => {
      if (error) return errorHandler(error);
    });
  }

  updateNotifier({
    pkg: manifest,
    updateCheckInterval: 1000 * 30
  }).notify();

  if (frun()) {
    const settingsCleared = await clearSettings();

    printBlock(
      chalk `Welcome to ${manifest.name}@${manifest.version} {bold @${
        userInfo().username
      }}`,
      chalk `{dim Application setup {green completed}!}`,
      chalk `{bold Enjoy "{yellow ${manifest.name}}" running {green splash}}`
    );

    console.log();

    return;
  }

  if (!command) {
    clear();

    if (!flags.me && !flags.updateMe)
      spinner.start("Connecting to Unsplash");

    try {
      let photo = false;

      // here you can add your own custom flags
      if (flags.updateMe) {
        const data = await updateMe();
        return printBlock(data);
      } else if (flags.me) {        
        const user = config.get('current-user-profile');
        const userData = chalk`
          {yellow Name}: ${user.name} {dim (@${user.username})}
          {yellow Bio}: ${user.bio}
          {yellow Location}: ${user.location}

          {dim —————————————————————————————————————————}

          {yellow Downloads Count}: ${user.downloads} 
          {yellow Photos Count}: ${user.photos.length}

          {dim —————————————————————————————————————————}

          {yellow Followers}: ${user.followers_count}
          {yellow Following}: ${user.following_count}
        `.split('\n').map(item => '  ' + item.trim()).join('\n')

        return printBlock(userData);
      } else if (flags.day) {
        const response = await getPhoto(await picOfTheDay());
        photo = await response.json();
      } else if (flags.curated) {
        const response = await listCuratedPhotos();
        const photos = await response.json();

        photo = randomFrom(photos);
      } else if (flags.id && parseID(flags.id)) {
        const response = await getPhoto(parseID(flags.id));
        photo = await response.json();
      } else {
        if (flags.id) {
          spinner.warn = chalk `Invalid ID: "{yellow ${flags.id}}"`;
        }
        const response = await getRandomPhoto({
          query: flags.query,
          username: flags.user,
          featured: Boolean(flags.featured),
          collections: flags.collection ? (flags.collection.includes(',') ? flags.collection.split(',').map(parseCollection) : [parseCollection(flags.collection)]) : undefined,
          count: 1
        });

        photo = await response.json();
      }

      if (photo) {
        spinner.succeed("Connected!");

        if (Array.isArray(photo)) {
          photo = photo[0];
        }

        if (photo.errors) {
          printBlock(chalk `{bold {red ERROR:}}`, ...photo.errors);
          return;
        }

        const res = await downloadPhoto(photo);
        const {
          url
        } = await res.json();
        const downloaded = await download(photo, url, flags, true);
      } else {
        spinner.fail("Unable to connect.");
      }
    } catch (error) {
      spinner.fail();
      return errorHandler(error);
    }
  } else {
    clear();
    console.log();

    switch (command) {
      case "settings":
        return commands.settings(subCommands);
        break;
      case "alias":
        return commands.alias(subCommands);
        break;
      case "login":
        await login();
        break;
      default:
        printBlock(
          chalk `{bold {red Error}}: "{yellow ${command}}" is not a {dim splash} command.`,
          ``,
          chalk `See {dim splash --help}`
        );
        break;
    }
  }
}