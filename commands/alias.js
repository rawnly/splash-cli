const clear = require('clear');

const Conf = require('conf');
const config = new Conf();
const chalk = require('chalk');

module.exports = (cmd1, cmd2) => {
	// Get current aliases
	const aliases = config.get('aliases');

	// Setup new alias
	const newAlias = {
		name: cmd1,
		value: cmd2
	};

	// Check if the alias exists with the same name / value (id)
	let exists = aliases.filter(alias => {
		return (alias.name === newAlias.name) || (alias.value === newAlias.value);
	});

	// If exists warn the user
	if (exists.length > 0) {
		exists = exists[0];
		clear();
		console.log();
		console.log('That alias exists!', chalk`[{yellow ${exists.name}} = {yellow ${exists.value}}]`);
		console.log();
		process.exit();
	}

	// If not push it to the array
	aliases.push(newAlias);

	// Set it in the config
	config.set('aliases', aliases);

	// Send a response
	clear();
	console.log();
	console.log('Alias saved.', chalk`[{yellow ${newAlias.name}} = {yellow ${newAlias.value}}]`);
	console.log();
};
