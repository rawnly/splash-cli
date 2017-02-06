# port-numbers
[![](https://img.shields.io/npm/v/port-numbers.svg?style=flat)](https://www.npmjs.org/package/port-numbers) [![](https://img.shields.io/npm/dm/port-numbers.svg)](https://www.npmjs.org/package/port-numbers) [![](https://api.travis-ci.org/silverwind/port-numbers.svg?style=flat)](https://travis-ci.org/silverwind/port-numbers)
> Get information on network port numbers and services, based on [IANA's public listing](http://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml).

### Installation
```
$ npm install --save port-numbers
```
### Example
```js
var pn = require("port-numbers");

pn.getService(80);
//=> { name: 'http', description: 'World Wide Web HTTP' }
pn.getService(3306);
//=> { name: 'mysql', description: 'MySQL' }
pn.getService(123, "udp");

pn.getPort('redis');
//=> { port: '6379', protocol: 'tcp', description: 'An advanced key-value cache and store' }
pn.getPort("postgresql");
//=> { port: '5432', protocol: 'tcp', description: 'PostgreSQL Database' }
pn.getPort('ntp', 'udp');
//=> { port: 123, protocol: 'udp', description: 'Network Time Protocol' }
```

### API
#### .getService(port[, protocol])
- `port` *Number* : the port to lookup. Required.
- `protocol` *String* : the protocol. Default: `tcp`.

#### .getPort(service[, protocol])
- `service` *String* : the service to lookup. Required.
- `protocol` *String* : the protocol. Default: `tcp`.

© [silverwind](https://github.com/silverwind), distributed under BSD licence
