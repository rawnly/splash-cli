require("babel-polyfill");
require("regenerator-runtime");

import fetch from 'isomorphic-fetch';
import printBlock from "@splash-cli/print-block";
import chalk from "chalk";
import Conf from "conf";
import figures from 'figures';
import { defaultSettings } from "../extra/config";



const config = new Conf({
  defaults: defaultSettings
});

export default function alias([action, alias, aliasID = false]) {
  const aliases = config.get("aliases") || [];

  switch (action) {
    case "delete":
    case "remove":
      const namesList = aliases.map(item => item.name)
      const valuesList = aliases.map(item => item.id)
      let item;
      
      if (namesList.indexOf(alias) >= 0) {
        item = aliases[namesList.indexOf(alias)].name
        aliases.splice(namesList.indexOf(alias), 1)
      } else if (valuesList.indexOf(alias) >= 0) {
        item = aliases[valuesList.indexOf(alias)].name
        aliases.splice(valuesList.indexOf(alias), 1)
      } else {
        return printBlock(chalk`{red {bold Error:}} Alias {yellow "${alias}"} not found.`, config.get('aliases'))
      }
      
      if (aliases) {
        config.set('aliases', aliases)
        printBlock(chalk`Alias: {yellow "${item}"} removed.`)
      }

      break;
    case "set":
      if (/[a-z\-\_]\=[0-9]{1,7}/.test(alias)) {
        const [name, id] = alias.split(/\=|\/|\:/g);

        if (aliases.filter(item => item.id === id || item.name === name).length) {
          return printBlock(
            chalk`{bold {red Error:}} Duplicate! An alias with these parameters already exists!`, 
            chalk`If you want replace it use {yellow 'alias remove'}`,
            '',
            ...aliases.map(item => chalk`{yellow ${item.name}}: ${item.id}`)
          )
        }

        // create the alias
        aliases.push({
          name,
          id
        })

        // Update alias
        config.set("aliases", aliases);
        printBlock(chalk `{bold Alias created!}`, `${name}: ${id}`);
      } else if (alias && aliasID) {
        if (aliases.filter(item => item.id === aliasID || item.name === alias).length) {
          return printBlock(
            chalk`{bold {red Error:}} Duplicate! An alias with these parameters already exists!`, 
            chalk`If you want replace it use {yellow 'alias remove'}`,
            '',
            ...aliases.map(item => chalk`{yellow ${item.name}}: ${item.id}`)
          )
        }

        // create the alias
        aliases.push({
          name: alias,
          id: aliasID
        })
        // Update alias
        config.set("aliases", aliases);
        printBlock(chalk `{bold Alias created!}`, `${alias}: ${aliasID}`);
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

      printBlock(
        chalk.bold.red('Invalid Alias'), 
        '', 
        '', 
        chalk`{cyan Aliases: (${aliases.length})}`, 
        '', 
        ...aliases.map(item => chalk`{dim ${figures.pointer}} {yellow ${item.name}}: ${item.id}`)
      )
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