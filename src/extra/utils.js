require("babel-polyfill");
require("regenerator-runtime");

import got from "got";
import Conf from "conf";
import chalk from "chalk";
import { URL } from "url";
import { JSDOM } from "jsdom";
import urlRegex from "url-regex";
import printBlock from "@splash-cli/print-block";
import parseID from "@splash-cli/parse-unsplash-id";

import { keys, defaultSettings } from "./config";

const config = new Conf();

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    await callback(element, index, array);
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

/**
 *
 * @param {String} alias
 * @returns Collection id or false
 */
export const parseCollectionAlias = alias => {
  const aliases = config.get("aliases");

  const collection = aliases.filter(item => item.name === alias).shift();

  if (collection) {
    return collection;
  }

  return false;
};

/**
 *
 * @param {String} id Collection ID
 * @param {Boolean} isCurated isCurated?
 */
export async function collectionInfo(id, isCurated = false) {
  let collectionURL = `https://api.unsplash.com/collections/${id}?client_id=a70f2ffae3634a7bbb5b3f94998e49ccb2e85922fa3215ccb61e022cf57ca72c`;

  try {
    if (isCurated) {
      collectionURL = `https://api.unsplash.com/collections/curated/${id}?client_id=a70f2ffae3634a7bbb5b3f94998e49ccb2e85922fa3215ccb61e022cf57ca72c`;
    }

    const {
      body: {
        id: collectionID,
        title,
        description,
        featured,
        curated,
        total_photos: count,
        user: { username },
        links: { self, photos }
      }
    } = await gotJSON(collectionURL);

    return {
      collectionID,
      title,
      description,
      featured,
      curated,
      count,
      user: username,
      url: {
        self: addParams(self, {
          client_id: config.get("token")
        }),
        photos: addParams(photos, {
          client_id: config.get("token")
        })
      }
    };
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {String} collection Collection URL or ID
 */
export async function downloadCollection(collection) {
  let id;
  const isURL =
    urlRegex().test(collection) &&
    /unsplash|collection\/\d+$|curated\/\d+$/g.test(collection);
  const isCollectionID = /\d+/g.test(collection);
  const isCurated =
    /\/curated\/\d+$/g.test(collection) || /^\d{1,3}$/g.test(collection);

  if (isURL) {
    id = parseCollectionURL(collection).id;
  } else if (isCollectionID) {
    id = collection;
  } else {
    return errorHandler(
      new Error(chalk`Invalid URL/ID: "{underline {dim ${collection}}}"`)
    );
  }

  try {
    const { url } = await collectionInfo(id, isCurated);
    const { body: photos } = await gotJSON(url.photos);

    return photos;
  } catch (error) {
    return errorHandler(error);
  }
}

export const parseCollectionURL = url => {
  let collectionArguments = [];
  const collection = {};
  let COLLECTION_REGEX;

  const isCurated = /\/curated\/\d+$/g.test(url);

  if (isCurated) {
    COLLECTION_REGEX = /curated\/(\d{1,4})$/;
  } else {
    COLLECTION_REGEX = /(\d+)\/([a-z\-]+)$/;
  }

  if (COLLECTION_REGEX.test(url)) {
    collectionArguments = url.match(COLLECTION_REGEX);

    if (isCurated) {
      collection.id = collectionArguments[1];
    } else {
      collection.name = collectionArguments[2];
      collection.id = collectionArguments[1];
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

    if (selectedCollection.id) {
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
        info.curated ? "Curated" : "",
        info.curated && info.featured ? " - " : "",
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
    const { body } = response;

    if (isJSON(body)) {
      return {
        response,
        body: JSON.parse(body)
      };
    }

    return {
      response,
      body
    };
  } catch (error) {
    // throw error;
    return error;
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

export function addParams(rawURL, params) {
  const url = new URL(rawURL);
  const keys = Object.keys(params);

  keys.forEach(key => {
    url.searchParams.set(key, params[key]);
  });

  return url.href;
}
