'use strict';
module.exports = (str, count, indent) => {
	indent = indent === undefined ? ' ' : indent;
	count = count === undefined ? 1 : count;

	if (typeof str !== 'string') {
		throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof str}\``);
	}

	if (typeof count !== 'number') {
		throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``);
	}

	if (typeof indent !== 'string') {
		throw new TypeError(`Expected \`indent\` to be a \`string\`, got \`${typeof indent}\``);
	}

	if (count === 0) {
		return str;
	}

	return str.replace(/^(?!\s*$)/mg, indent.repeat(count));
};
