require("babel-polyfill");
require("regenerator-runtime");

import got from "got";
import Conf from "conf";
import chalk from "chalk";
import { URL } from "url";
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

export const parseCollection = alias => {
  const aliases = config.get("aliases");

  const collection = aliases.filter(item => item.name === alias).shift();

  if (collection) {
    return collection;
  }

  return false;
};

export const collectionInfo = async id => {
  try {
    let { body } = await got(
      `${keys.api.base}/collections/${id}?client_id=${config.get(
        "splash-token"
      )}`
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
export async function downloadFlags(
  url,
  { id, user, orientation, query, collection, featured } = {}
) {
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
      "splash-token"
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
      parseCollection(selectedCollection) || {};

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
