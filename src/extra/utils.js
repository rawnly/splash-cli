require("babel-polyfill");
require("regenerator-runtime");

import got from "got";
import Conf from "conf";
import chalk from "chalk";
import { URL } from "url";
import { JSDOM } from "jsdom";
import printBlock from "@splash-cli/print-block";
import parseID from "@splash-cli/parse-unsplash-id";

import { keys, defaultSettings } from "./config";

const config = new Conf();

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    await callback((element, index, array));
  }
}

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

export const parseCollectionAlias = alias => {
  const aliases = config.get("aliases") || [];

  const collection = aliases.filter(item => item.name === alias).shift();

  if (collection) {
    return collection;
  }

  return false;
};

export const collectionInfo = async (id, isCurated) => {
  let collectionURL = `https://api.unsplash.com/collections/${id}?client_id=${
    keys.api.client_id
  }`;

  try {
    let { body } = await got(
      `${keys.api.base}/collections/${id}?client_id=${config.get("token")}`
    );
    body = JSON.parse(body);

    return {
      id: body.id,
      title: body.title,
      description: body.description,
      user: body.user.username,
      featured: body.featured,
      curated: body.curated
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const parseCollectionURL = url => {
  let collectionArguments = [];
  const collection = {};
  let COLLECTION_REGEX;

  const isCurated = /\/curated\//g.test(url);

  if (isCurated) {
    COLLECTION_REGEX = /[a-zA-z-]+\/[0-9]+/;
  } else {
    COLLECTION_REGEX = /[0-9]+\/[a-zA-z-]+/;
  }

  if (COLLECTION_REGEX.test(url)) {
    collectionArguments = url.match(COLLECTION_REGEX)[0].split("/");

    if (isCurated) {
      collection.name = collectionArguments[0];
      collection.id = collectionArguments[1];
    } else {
      collection.name = collectionArguments[1];
      collection.id = collectionArguments[0];
    }

    return collection;
  }

  return url;
};

export function errorHandler(error) {
  printBlock(
    chalk`OOps! We got an error!`,
    chalk`Please report it at: {underline {green https://github.com/splash-cli/splash-cli/issues}}`,
    chalk`{yellow Splash Error:}`
  );
  throw error;
}

// Thanks to @wOxxOm on codereview.stackexchange.com - https://codereview.stackexchange.com/questions/180006/how-can-i-make-my-function-easier-to-read-understand?noredirect=1#comment341954_180006
/**
 *
 * @param {String} url
 * @param {Object} options
 */
export async function downloadFlags(url, flags) {
  let photoOfTheDay = false;
  const { id, user, orientation, query, collection, featured } = flags;
  const ORIENTATIONS = {
    landscape: "landscape",
    horizontal: "landscape",
    portrait: "portrait",
    vertical: "portrait",
    squarish: "squarish",
    square: "squarish"
  };

  if (id) {
    const photoID = parseID(id);

    if (!photoID) {
      printBlock(chalk`{red {bold Invalid}} {yellow url/id}`);
    }

    return `${keys.api.base}/photos/${photoID}?client_id=${config.get(
      "token"
    )}`;
  } else if (flags.day) {
    const photo = await picOfTheDay();
    const photoID = parseID(photo);

    if (!photoID) {
      printBlock(chalk`{red {bold Invalid}} {yellow url/id}`);
    }

    return `${keys.api.base}/photos/${photoID}?client_id=${config.get(
      "token"
    )}`;
  }

  const parsedURL = new URL(url);

  if (orientation) {
    const photoOrientation =
      ORIENTATIONS[orientation] || config.get("orientation") || undefined;
    parsedURL.searchParams.set("orientation", photoOrientation);
  }

  const finalizeUrlWith = (name, value) => {
    parsedURL.searchParams.set(name, value);
    return parsedURL.href;
  };

  if (query) {
    finalizeUrlWith("query", query.toLowerCase());
  }

  if (user) {
    finalizeUrlWith("username", user.toLowerCase());
  }

  if (featured) {
    finalizeUrlWith("featured", true);
  }

  if (collection) {
    let selectedCollection = parseCollectionURL(collection);

    if (selectedCollection.id && selectedCollection.name) {
      selectedCollection = selectedCollection.id;
    }

    const { value = /[0-9]{3,7}|$/.exec(selectedCollection)[0] } =
      parseCollectionAlias(selectedCollection) || {};

    if (!value) {
      printBlock(chalk`{red Invalid collection ID}`);
      process.exit();
    }

    const info = await collectionInfo(value);

    let message = chalk`Collection: {cyan ${info.title}} by {yellow @${
      info.user
    }}`;

    if (info.featured || info.curated) {
      message = `[${[
        info.curated ? "Curated - " : "",
        info.featured ? "Featured" : ""
      ].join("")}] ${message}`;
    }

    printBlock(message);

    return finalizeUrlWith("collections", info.id);
  }

  return parsedURL.href;
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

    return photoOfTheDay;
  } catch (error) {
    throw error;
  }
}

// Experimental
export async function gotJSON(url, options) {
  try {
    const response = await got(url, options);
    const { body, satusCode, statusMessage } = response;

    if (isJSON(body)) {
      return {
        response,
        body: JSON.parse(body),
        status: {
          code: statusCode,
          message: statusMessage
        }
      };
    }

    return {
      response,
      body,
      status: {
        code: statusCode,
        message: statusMessage
      }
    };
  } catch (error) {
    throw error;
  }
}

export function isJSON(data) {
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

export function isPath(string) {
  return /([a-z]\:|)(\w+|\~+|\.|)\\\w+|(\w+|\~+|)\/\w+/i.test(string);
}
