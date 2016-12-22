
# dot

  MongoDB-style "dot notation" querying for JavaScript.

## Installation

```
$ component install component/dot
```

## Example

```js
var dot = require('dot');
var obj = {
  name: {
    first: "tobi"
  },
  pets: [
    { id: 1, name: 'loki' },
    { id: 2, name: 'jane' }
  ]
};

dot.get(obj, 'name.first'); // tobi
dot.get(obj, 'name.1.id'); // 2
dot.parent(obj, 'name.first'); // obj.name
dot.set(obj, 'name.1.name', 'Jane');
```

## API

### get(obj, path)

  Queries the given `path` in `obj`.

### set(obj, path, val, init)

  Sets the given `path` to `val` in obj.
  If `init` is false it won't initialize the path if it doesn't exit.

### parent(obj, path, init)

  Returns the parent object/array that contains `path` within `obj`.
  Could be `obj` itself. If `init` is true it initializes the path.

## License 

  MIT
