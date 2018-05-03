require("babel-polyfill");
require("regenerator-runtime");

import Conf from "conf";
import chalk from "chalk";

import printBlock from "@splash-cli/print-block";

import { errorHandler } from "../extra/utils";
import { defaultSettings } from "../extra/config";

const config = new Conf({
  defaults: defaultSettings
});

export default function alias([action, alias, aliasID = false]) {
  const aliases = config.get("aliases") || [];

  switch (action) {
    case "set":
      if (/[a-z\-\_]\=[0-9]{1,7}/.test(alias)) {
        const [name, id] = alias.split(/\=|\/|\:/g);

        // create the alias
        aliases[name] = id;

        // Update alias
        config.set("aliases", aliases);
        printBlock(chalk`{bold Alias created!}`, `${name}: ${id}`);
      } else if (alias && aliasID) {
        // create the alias
        aliases[alias] = aliasID;

        // Update alias
        config.set("aliases", aliases);
        printBlock(chalk`{bold Alias created!}`, `${name}: ${id}`);
      } else {
        printBlock(
          chalk`{bold {red Invalid alias!}}`,
          "",
          chalk`Please use {underline the following syntax}:`,
          "",
          chalk`{dim $ splash} {green alias} {yellow name=id}`,
          chalk`{dim $ splash} {green alias} {yellow name id}`
        );
      }
      break;
    case "get":
      printBlock(chalk`{bold {yellow "${alias}"}}: ${aliases[alias]}`);
      break;
    default:
      printBlock(
        chalk`Invalid action "{red ${action}}"`,
        `Allowed actions are:`,
        ` - set`,
        ` - get`
      );
      break;
  }
}
