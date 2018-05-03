require("babel-polyfill");
require("regenerator-runtime");

import Conf from "conf";
import chalk from "chalk";
import { prompt as ask } from "inquirer";

import printBlock from "@splash-cli/print-block";
import pathFixer from "@splash-cli/path-fixer";

import { clearSettings, errorHandler } from "../extra/utils";
import { defaultSettings } from "../extra/config";

const config = new Conf({
  defaults: defaultSettings
});

export default async function settings([action, target]) {
  const questions = [];
  
  // @todo Add user authentication
  // @body Having user authentication would be nice for collection management and likes.

  const _directory = generateQuestion("_directory", "Default download path:", {
    default: config.get("directory"),
    filter: input => pathFixer(input)
  });

  const _userFolder = generateQuestion(
    "_userFolder",
    "Do you want store photos by username?",
    {
      default: config.get("userFolder"),
      type: "confirm"
    }
  );

  switch (action) {
    case "get":
      const settings = target ? config.get(target) : config.get();

      settings["settings-path"] = config.path;

      printBlock(chalk`Settings:`, settings);
      break;
    case "clear":
    case "reset":
    case "restore":
      ask([
        generateQuestion(
          "confirm",
          chalk`Are you sure? This action is {underline NOT reversable}!`,
          {
            type: "confirm",
            default: false
          }
        )
      ])
        .then(async ({ confirm }) => {
          if (confirm) {
            await clearSettings();
            printBlock(chalk`{yellow Settings Restored!}`);
          } else {
            printBlock(chalk`{red {bold Operation aborted!}}`);
          }
        })
        .catch(error => {
          errorHandler(error);
        });
      break;

    case "set":
    default:
      switch (target) {
        case "directory":
        case "dir":
          questions.push(_directory);
          break;
        case "user":
        case "user-folder":
        case "userFolder":
        case "groups":
          questions.push(_userFolder);
        default:
          questions.push(_userFolder, _directory);
          break;
      }

      const { _userFolder: folder, _directory: dir } = await ask(questions);

      if (folder !== undefined) {
        config.set("userFolder", folder);
        return printBlock(
          chalk`{bold Settings saved!}`,
          `Run:`,
          ``,
          chalk`{dim $ splash} {green settings {bold get}}`,
          ``,
          `To view them.`
        );
      } else if (dir !== undefined) {
        config.set("directory", dir);
        return printBlock(
          chalk`{bold Settings saved!}`,
          `Run:`,
          ``,
          chalk`{dim $ splash} {green settings {bold get}}`,
          ``,
          `To view them.`
        );
      } else if (folder !== undefined && dir !== undefined) {
        config.set({
          userFolder: folder,
          directory: dir
        });
        return printBlock(
          chalk`{bold Settings saved!}`,
          `Run:`,
          ``,
          chalk`{dim $ splash} {green settings {bold get}}`,
          ``,
          `To view them.`
        );
      }

      return printBlock(
        chalk`{bold {red OOPS!}}`,
        chalk`It seems that there were a {red problem} with your {cyan settings}...`,
        "",
        `{green Please try again} or {yellow report the issue} {dim (--report)}`
      );
      break;
  }
}

function generateQuestion(name, message, options = {}) {
  const fieldRequired = input => {
    if (input.length) return true;
    return `Error: that field is required!`;
  };

  options.validate = options.validate || fieldRequired;
  return Object.assign(
    {
      name,
      message,
      prefix: chalk.green("#")
    },
    options
  );
}
