require("babel-polyfill");

import fs from "fs";
import path from "path";

import { defaultSettings } from "../../extra/config";

import chalk from "chalk";
import printBlock from "@splash-cli/print-block";
import pathParser from "@splash-cli/path-fixer";

export default values => {
  const defaults = Object.assign({}, defaultSettings);
  const [write, out] = Object.keys(values);

  const folder = pathParser(defaults.directory);
  const exists = fs.existsSync(folder);

  if (exists) {
    let file = "splash_list";
    let files = fs.readdirSync(folder);

    const EXTENSION_REGEX = /\.[a-z]{2,}$/;

    const userFolders = files.filter(file => {
      return /^@/g.test(file);
    });

    files = files
      .filter(pic => {
        return EXTENSION_REGEX.test(pic);
      })
      .map(item => {
        return item.replace(EXTENSION_REGEX, "");
      });

    const subFolders = userFolders.map(sub => {
      return {
        user: sub,
        pics: fs
          .readdirSync(path.join(folder, sub))
          .filter(pic => {
            return EXTENSION_REGEX.test(pic);
          })
          .map(item => {
            return item.replace(EXTENSION_REGEX, "");
          })
      };
    });

    let list = {
      photos: files,
      users: subFolders,
      count: files.length
    };

    printBlock(write);
  } else {
    printBlock(chalk`{bold {red ERROR}}: folder ${folder} does not exists.`);
  }

  return true;
};
