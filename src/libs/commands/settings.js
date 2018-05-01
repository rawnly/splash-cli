require("babel-polyfill");

import { prompt } from "inquirer";
import Conf from "conf";
import chalk from "chalk";
import clear from "clear";
import frun from "first-run";

import pathParser from "@splash-cli/path-fixer";
import printBlock from "@splash-cli/print-block";

const config = new Conf();
const quit = process.exit;

export default async (
  { size, directory, auth, folders } = {},
  { restore } = {}
) => {
  clear();

  if (restore) {
    frun.clear();
    printBlock(chalk`{green Settings restored.}`);
    quit();
  }

  const questions = [];
  const choices = ["raw", "full", "regular", "thumb"];

  // TODO: Add user authentication.

  // const authQuestion = {
  //   name: "_auth",
  //   message: "Access Token",
  //   default: config.get("auth-key"),
  //   validate: token => {
  //     const regex = /[a-z0-9]/g;
  //     return regex.test(token) ? true : "Invalid token";
  //   }
  // };

  const sizeQuestion = {
    name: "_size",
    message: "Image size",
    type: "list",
    default: choices.indexOf(config.get("size")),
    choices
  };

  const directoryQuestion = {
    name: "_directory",
    message: "Default download path: ",
    default: config.get("directory"),
    filter: pathParser,
    validate: input => {
      input = input.trim();
      return input !== "";
    }
  };

  const usernameFolderQuestion = {
    name: "_folders",
    message: "Do you want use username's folders? (ex: @rawnly/..photos)",
    default: config.get("userFolder"),
    type: "confirm"
  };

  if (size || auth || directory || folders) {
    if (size && sizeQuestion) {
      questions.push(sizeQuestion);
    }

    if (folders && usernameFolderQuestion) {
      questions.push(usernameFolderQuestion);
    }

    if (auth && authQuestion) {
      questions.push(authQuestion);
    }

    if (directory && directoryQuestion) {
      questions.push(directoryQuestion);
    }
  } else {
    questions.push(sizeQuestion, directoryQuestion, usernameFolderQuestion);
  }

  // Get answers
  const { _size, _auth, _directory, _folders } = await prompt(questions);

  // Strong confirmation. keep user focus and prevent an accidental confirmation.
  const { confirm } = await prompt([
    {
      name: "confirm",
      message: chalk`Confirm ({yellow {bold yes}}/{yellow {bold no}}):`,
      validate: input => {
        if (input === "yes" || input === "no") {
          return true;
        }

        if (input === "ye" || input === "y") {
          return chalk`Please type "{yellow {bold yes}}"`;
        }

        if (input === "n" || input === "o") {
          return chalk`Please type "{yellow {bold no}}"`;
        }

        return chalk`Please type "{yellow {bold yes}}" or "{yellow {bold no}}"`;
      }
    }
  ]);

  if (confirm === "yes") {
    if (_size) {
      config.set("size", _size);
    }

    if (_auth) {
      config.set("auth-key", _auth);
    }

    if (_folders) {
      config.set("userFolder", _folders);
    }

    if (_directory) {
      config.set("directory", _directory);
    }

    printBlock(chalk`{green Settings created!}`);
  } else {
    printBlock(chalk`{red Operation aborted}`);
  }
};
