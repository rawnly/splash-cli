NPM License
===================
(Original credit to https://github.com/davglass/license-checker)

Ever needed to see all the license info for a module and it's dependencies?

It's this easy:

```
npm install -g npm-license 

mkdir foo
cd foo
npm install yui-lint
npm-license
```

You should see something like this:

```
scanning ./yui-lint
├─ cli@0.4.3
│  ├─ repository: http://github.com/chriso/cli
│  └─ licenses: MIT
├─ glob@3.1.14
│  ├─ repository: https://github.com/isaacs/node-glob
│  └─ licenses: UNKNOWN
├─ graceful-fs@1.1.14
│  ├─ repository: https://github.com/isaacs/node-graceful-fs
│  └─ licenses: UNKNOWN
├─ inherits@1.0.0
│  ├─ repository: https://github.com/isaacs/inherits
│  └─ licenses: UNKNOWN
├─ jshint@0.9.1
│  └─ licenses: MIT
├─ lru-cache@1.0.6
│  ├─ repository: https://github.com/isaacs/node-lru-cache
│  └─ licenses: MIT
├─ lru-cache@2.0.4
│  ├─ repository: https://github.com/isaacs/node-lru-cache
│  └─ licenses: MIT
├─ minimatch@0.0.5
│  ├─ repository: https://github.com/isaacs/minimatch
│  └─ licenses: MIT
├─ minimatch@0.2.9
│  ├─ repository: https://github.com/isaacs/minimatch
│  └─ licenses: MIT
├─ sigmund@1.0.0
│  ├─ repository: https://github.com/isaacs/sigmund
│  └─ licenses: UNKNOWN
└─ yui-lint@0.1.1
   ├─ licenses: BSD
      └─ repository: http://github.com/yui/yui-lint
```

You can also specify `--unknown` to only show licenses that it can't determine or guessed at (from README)

Also supports `--json /path/to/save.json` to export the data.

Requiring
---------


```javascript
var checker = require('npm-license');

checker.init({
    start: '/path/to/start/looking'
}, function(json) {
    //The sorted json data
});

```

Options (Defaults)
------------------
Below are the list of defaults and their descriptions.
You may pass them either as a module or through the command line (ie. `npm-license --depth=3`)

```javascript
{
  unknown: false,          // Boolean: generate only a list of unknown licenses
  start: '.',              // String: path to start the dependency checks
  depth: 1,                // Number: how deep to recurse through the dependencies
  include: 'dependencies', // String | Array | 'all': recurse through various types of dependencies (https://npmjs.org/doc/json.html)
  meta: null               // String: path to a metadata json file (see below)
}
```

Passing in additional metadata
------------------------------
With the `meta` option, you may pass in the path (relative to cwd) to a json file containing a structure similar to:

```javascript
{
  "mydep1@0.0.1": "MIT",
  "mydep2@0.10.1": "WTFPL",
  "mydep3@0.2.0": {
    "licenses": ["BSD", "Apache 2.0"]
  },
  "mydep4@0.5.10": {
    "licenses": "GPL",
    "repository": "http://path/to/repo"
  }
}
```
Whatever you specify in this file overrides the inspection done by npm-license.  This is particularly useful for cases where the license exists for a dependency, but the library wasn't able to pick it up with its usual methods.
