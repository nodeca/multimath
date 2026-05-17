import base64decode from './base64decode.mjs'
import hasWebAssembly from './wa_detect.mjs'

const DEFAULT_OPTIONS = {
  js: true,
  wasm: true
}

class MultiMath {
  constructor (options) {
    const opts = Object.assign({}, DEFAULT_OPTIONS, options || {})

    this.options = opts

    this.__cache = {}

    this.__init_promise = null
    this.__modules = opts.modules || {}
    this.__memory = null
    this.__wasm = {}

    this.__isLE = ((new Uint32Array((new Uint8Array([1, 0, 0, 0])).buffer))[0] === 1)

    if (!this.options.js && !this.options.wasm) {
      throw new Error('mathlib: at least "js" or "wasm" should be enabled')
    }
  }

  has_wasm () { return hasWebAssembly() }

  use (module) {
    this.__modules[module.name] = module

    // Pin the best possible implementation
    if (this.options.wasm && this.has_wasm() && module.wasm_fn) {
      this[module.name] = module.wasm_fn
    } else {
      this[module.name] = module.fn
    }

    return this
  }

  init () {
    if (this.__init_promise) return this.__init_promise

    if (!this.options.js && this.options.wasm && !this.has_wasm()) {
      return Promise.reject(new Error('mathlib: only "wasm" was enabled, but it\'s not supported'))
    }

    this.__init_promise = Promise.all(Object.keys(this.__modules).map(name => {
      const module = this.__modules[name]

      if (!this.options.wasm || !this.has_wasm() || !module.wasm_fn) return null

      // If already compiled - exit
      if (this.__wasm[name]) return null

      // Compile wasm source
      return WebAssembly.compile(base64decode(module.wasm_src))
        .then(m => { this.__wasm[name] = m })
    }))
      .then(() => this)

    return this.__init_promise
  }

  // //////////////////////////////////////////////////////////////////////////////
  // Methods below are for internal use from plugins

  // Increase current memory to include specified number of bytes. Do nothing if
  // size is already ok. You probably don't need to call this method directly,
  // because it will be invoked from `.__instance()`.
  //
  __reallocate (bytes) {
    if (!this.__memory) {
      this.__memory = new WebAssembly.Memory({
        initial: Math.ceil(bytes / (64 * 1024))
      })
      return this.__memory
    }

    const mem_size = this.__memory.buffer.byteLength

    if (mem_size < bytes) {
      this.__memory.grow(Math.ceil((bytes - mem_size) / (64 * 1024)))
    }

    return this.__memory
  }

  // Returns instantinated webassembly item by name, with specified memory size
  // and environment.
  // - use cache if available
  // - do sync module init, if async init was not called earlier
  // - allocate memory if not enougth
  // - can export functions to webassembly via "env_extra",
  //   for example, { exp: Math.exp }
  //
  __instance (name, memsize, env_extra) {
    if (memsize) this.__reallocate(memsize)

    // If .init() was not called, do sync compile
    if (!this.__wasm[name]) {
      const module = this.__modules[name]
      this.__wasm[name] = new WebAssembly.Module(base64decode(module.wasm_src))
    }

    if (!this.__cache[name]) {
      const env_base = {
        memoryBase: 0,
        memory: this.__memory,
        tableBase: 0,
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
      }

      this.__cache[name] = new WebAssembly.Instance(this.__wasm[name], {
        env: Object.assign(env_base, env_extra || {})
      })
    }

    return this.__cache[name]
  }

  // Helper to calculate memory aligh for pointers. Webassembly does not require
  // this, but you may wish to experiment. Default base = 8;
  //
  __align (number, base) {
    base = base || 8
    const reminder = number % base
    return number + (reminder ? base - reminder : 0)
  }
}

export default MultiMath
