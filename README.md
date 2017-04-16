multimath - fast image math in WebAssembly and JS
=================================================

[![Build Status](https://travis-ci.org/nodeca/multimath.svg?branch=master)](https://travis-ci.org/nodeca/multimath)
[![NPM version](https://img.shields.io/npm/v/multimath.svg)](https://www.npmjs.org/package/multimath)

> - Core loader for webassembly/javascript math functions.
> - Built in implementations for some math functions.

`multimath` simplifies creation of small CPU-intensive webassembly modules
with fallback to javascript implementations.

- It cares about parallel async modules init.
- Has built-in helpers to write webassembly code without additional runtimes.
- Use shared memory to chain webassembly calls without memory copy.

Built-in functions (curently - unsharp mask) avalable as example for your
extensions.


Install
-------

```bash
npm install multimath
```


Use
---

```js
const mm = require('multimath')()
             .use(require('multimath/lib/unsharp_mask'))
             .use(require('your_custom_module'))

mm.init().then(() => {
  mm.unsharp_mask(rgba_buffer, width, height);
});
```


API
---


### new multimath(options)

Create library instance. Sugar - `multimath(options)` (without `new`).

```js
const mm = require('multimath')({
  js:      true,   // For testing only, set false when should be sure
                   // that wasm implementation used.
  wasm:    true    // For testing only, set false when should be sure
                   // that js implementation used.

  modules: {}      // Compiled modules, for faster init in webworkers
});
```


### .use(module)

Register new module, format is:

```js
{
  name:     String,    // default wasm module & function name to expose
  fn:       Function,  // JS implementation
  wasm_fn:  Function,  // WebAssembly glue
  wasm_src: String     // Base64 encodes WebAssembly module
}
```

See example implementations in `lib/` folder.


Licence
-------

[MIT](https://github.com/nodeca/multimath/blob/master/LICENSE)
