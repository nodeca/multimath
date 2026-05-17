multimath
=========

[![NPM version](https://img.shields.io/npm/v/multimath.svg)](https://www.npmjs.org/package/multimath)

> Core to create fast image math in WebAssembly and JS.

`multimath` simplifies creation of small CPU-intensive webassembly modules
with fallback to JavaScript implementations.

- It cares about modules init, memory management and other things.
- Has built-in helpers to write webassembly code without additional runtimes.
- Use shared memory to chain webassembly calls without memory copy.

Built-in functions (currently - unsharp mask) are available as examples for
your extensions.


Install
-------

```bash
npm install multimath
```


Use
---

```js
import { MultiMath, unsharp_mask_plugin } from 'multimath'

const mm = new MultiMath()
             .use(unsharp_mask_plugin)
             .use(your_custom_plugin)

// Simple sync call. Will use sync wasm compile. Ok for webworkers.
// Can freeze interface at first call if wasm source is too big.
mm.unsharp_mask(rgba_buffer, width, height)

// Async init, compile all modules at once in async way.
await mm.init()
mm.unsharp_mask(rgba_buffer, width, height)
```


API
---


### new MultiMath(options)

Create library instance.

```js
const mm = new MultiMath({
  // Options are not mandatory, but you can disable js or wasm
  // implementations for testing
  js:   true,
  wasm: true
})
```


### .use(plugin)

Register new plugin, format is:

```js
{
  name:     String,    // method name to expose on instance
  fn:       Function,  // JS implementation
  wasm_fn:  Function,  // WebAssembly glue
  wasm_src: String     // Base64 encoded WebAssembly module
}
```

See `lib/unsharp_mask_plugin/` as an example implementation.


### .init() -> Promise

Optional. Compile all wasm modules asynchronously. Useful when:

1. Wasm module > 4K AND running in the main thread (not in a webworker).
   Some browsers prohibit sync wasm creation in this case.
2. Many small modules that should all be initialized before first use.

Note: a 3K wasm file initializes in ~3ms.


### .<your_method>

All plugins loaded via `.use()` pin their methods to the `MultiMath` instance.
The best implementation is selected automatically based on browser features
and constructor options.


### Development

Ways to go with your own plugins:

- See `lib/unsharp_mask_plugin/` as an example.
- See how [pica](https://github.com/nodeca/pica) uses this library.
