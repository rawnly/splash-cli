require("babel-polyfill");
require("regenerator-runtime");

import Conf from "conf";
import chalk from "chalk";

import printBlock from "@splash-cli/print-block";
import figures from 'figures';

import {
  errorHandler
} from "../extra/utils";
import {
  defaultSettings
} from "../extra/config";

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
        aliases.push({
          name,
          id
        })

        // Update alias
        config.set("aliases", aliases);
        printBlock(chalk `{bold Alias created!}`, `${name}: ${id}`);
      } else if (alias && aliasID) {
        // create the alias
        aliases.push({
          name: alias,
          id: aliasID
        })
        // Update alias
        config.set("aliases", aliases);
        printBlock(chalk `{bold Alias created!}`, `${name}: ${id}`);
      } else {
        printBlock(
          chalk `{bold {red Invalid alias!}}`,
          "",
          chalk `Please use {underline the following syntax}:`,
          "",
          chalk `{dim $ splash} {green alias} {yellow name=id}`,
          chalk `{dim $ splash} {green alias} {yellow name id}`
        );
      }
      break;
    case "get":
      alias = {
        name: alias,
        id: aliases.filter(item => item.name === alias).length ? aliases.filter(item => item.name === alias)[0].id : false
      }

      if (alias.id) {
        return printBlock(chalk `{bold {yellow "${alias.name}"}}: ${alias.id}`);
      }

      printBlock(chalk.bold.red('Invalid Alias'), '', '', chalk `{cyan Aliases: (${aliases.length})}`, '', aliases.map(alias => chalk `${figures.pointer} {yellow ${alias.name.toUpperCase()}}: {dim ${alias.id}}`).join('\n'))
      break;
    default:
      printBlock(
        chalk `Invalid action "{red ${action}}"`,
        `Allowed actions are:`,
        ` - set`,
        ` - get`
      );
      break;
  }
}