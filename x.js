const got = require('got');

got('https://analytics.splash-cli.app/api/users', {
	method: 'POST',
}).catch(console.error);
