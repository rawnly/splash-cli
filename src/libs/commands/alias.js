require("babel-polyfill");

import Conf from "conf";
import chalk from "chalk";
import printBlock from "@splash-cli/print-block";

const config = new Conf();
const quit = process.exit;

export default input => {
  const [name, value] = [Object.keys(input)[1], Object.keys(input)[0]];
  if (!name || !value) {
    printBlock("Invalid alias.");
    quit();
  }

  // Get current aliases
  const aliases = config.get("aliases") || [];

  // Setup new alias
  const newAlias = {
    name,
    value
  };

  // Check if the alias exists with the same name / value (id)
  let exists = aliases.filter(alias => {
    return alias.name === newAlias.name || alias.value === newAlias.value;
  });

  // If exists warn the user
  if (exists.length > 0) {
    exists = exists[0];
    printBlock(
      chalk`That alias exists! [{yellow ${exists.name}} = {yellow ${
        exists.value
      }}]`
    );
    process.exit();
  }

  // If not push it to the array
  aliases.push(newAlias);

  // Set it in the config
  config.set("aliases", aliases);

  // Send a response
  printBlock(
    chalk`Alias saved. [{yellow ${newAlias.name}} = {yellow ${newAlias.value}}]`
  );
};
