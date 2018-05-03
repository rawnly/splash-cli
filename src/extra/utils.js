require("babel-polyfill");
require("regenerator-runtime");

import fs from "fs";
import path from "path";
import https from "https";

import got from "got";
import Ora from "ora";
import Conf from "conf";
import chalk from "chalk";
import { URL } from "url";
import mkdirp from "mkdirp";
import RemoteFile from "simple-download";
import { JSDOM } from "jsdom";
import wallpaper from "wallpaper";
import isMonth from "@splash-cli/is-month";
import showCopy from "@splash-cli/show-copy";
import printBlock from "@splash-cli/print-block";
import pathFixer from "@splash-cli/path-fixer";

import { keys, defaultSettings } from "./config";

const config = new Conf();

export async function clearSettings() {
  const settingsList = Object.keys(defaultSettings);

  await asyncForEach(settingsList, async setting => {
    if (config.has(setting)) {
      config.delete(setting);
      config.set(setting, defaultSettings[setting]);
    }
  });

  return config.get() === defaultSettings;
}

export const parseCollection = alias => {
  const aliases = config.get("aliases") || [];
  const collection = aliases.filter(item => item.name === alias).shift();

  if (collection) {
    return collection;
  }

  return false;
};

export function errorHandler(error) {
  const spinner = new Ora();
  spinner.stop();
  printBlock(
    chalk`OOps! We got an error!`,
    chalk`Please report it at: {underline {green https://github.com/splash-cli/splash-cli/issues}}`,
    chalk`{yellow Splash Error:}`
  );
  throw error;
}

export function repeatChar(char, length) {
  var string = "";
  for (let i = 0; i < length; i++) {
    string += char;
  }

  return string;
}

export async function picOfTheDay() {
  const date = new Date();
  const today = `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`;

  if (
    config.has("pic-of-the-day") &&
    config.get("pic-of-the-day").date == today
  ) {
    return config.get("pic-of-the-day").photo;
  }

  try {
    const { body: html } = await got("https://unsplash.com");

    const {
      window: { document }
    } = new JSDOM(html);
    const links = document.querySelectorAll("a");
    const photoOfTheDay = Object.keys(links)
      .map(key => {
        return links[key];
      })
      .filter(el => {
        const regex = new RegExp("Photo of the Day", "i");
        return regex.test(el.innerHTML);
      })
      .map(link => link.href)
      .shift()
      .match(/[a-zA-Z0-9_-]{11}/g)[0];

    config.set("pic-of-the-day", {
      date: today,
      photo: photoOfTheDay
    });

    // RETURNS THE ID OF THE PHOTO
    return photoOfTheDay;
  } catch (error) {
    errorHandler(error);
  }
}

export function isPath(string) {
  return /([a-z]\:|)(\w+|\~+|\.|)\\\w+|(\w+|\~+|)\/\w+/i.test(string);
}

export async function download(photo, url, flags, setAsWP = true) {
  let dir = config.get("directory");

  if (flags.quiet) {
    console.log = console.info = () => {};
    spinner.start = spinner.fail = () => {};
  }

  if (config.get("userFolder") === true) {
    dir = path.join(config.get("directory"), `@${photo.user.username}`);
  }

  mkdirp.sync(dir);

  const spinner = new Ora({
    text: "Making something awesome",
    color: "yellow",
    spinner: isMonth("december") ? "christmas" : "earth"
  });

  spinner.start();

  let filename = path.join(dir, `${photo.id}.jpg`);

  if (flags.save && isPath(flags.save)) {
    filename = path.join(pathFixer(flags.save));
  }

  const remotePhoto = new RemoteFile(url, filename);
  remotePhoto.download().then(fileInfo => {
    config.set("counter", config.get("counter") + 1);

    if (!flags.quiet) spinner.succeed();
    if (setAsWP && !flags.save) {
      wallpaper.set(filename);
    } else {
      console.log();
      printBlock(chalk`Picture stored at:`, fileInfo.dir, fileInfo.base);
      console.log();
      return;
    }

    console.log();

    showCopy(photo, flags.info);

    console.log();
  });
}

export function parseUsername(username) {
  if (Boolean(username)) return username.toLowerCase().match(/[a-z0-9]/g)[0];
  return username;
}
