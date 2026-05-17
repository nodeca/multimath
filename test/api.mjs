import { describe, it } from 'node:test'
import assert from 'node:assert'
import wa_detect from '../lib/wa_detect.mjs'
import { MultiMath, unsharp_mask_plugin } from '../lib/index.mjs'

describe('Utilities', function () {
  it('wa_detect', function () {
    assert.equal(wa_detect(), true)
    // for coverage
    wa_detect()
  })

  it('throws of both js & wasm are disables', function () {
    assert.throws(function () {
      // eslint-disable-next-line no-new
      new MultiMath({ js: false, wasm: false })
    })
  })

  it('.__align()', function () {
    const m = new MultiMath()

    assert(m.__align(8), 8)
    assert(m.__align(3, 4), 4)
    assert(m.__align(3), 8)
    assert(m.__align(5, 4), 8)
    assert(m.__align(5), 8)
  })

  it('.__reallocate()', function () {
    const m = new MultiMath()

    m.__reallocate(1)
    assert.equal(m.__memory.buffer.byteLength, 65536)
    m.__reallocate(100000)
    assert.equal(m.__memory.buffer.byteLength, 131072)
    // coverage
    m.__reallocate(100000)
    assert.equal(m.__memory.buffer.byteLength, 131072)
  })

  it('.__instance()', function () {
    // coverage only
    const m = new MultiMath().use(unsharp_mask_plugin)

    m.__instance('unsharp_mask', 1, { exp: Math.exp })
    m.__instance('unsharp_mask', 1, { exp: Math.exp }) // cached
  })

  it('.init() with default options', function () {
    const instance = new MultiMath()
    instance.has_wasm = () => true

    instance.use(unsharp_mask_plugin).init()

    assert.equal(instance.unsharp_mask, unsharp_mask_plugin.wasm_fn)
  })

  it('.init() with default options and not supported wasm', function () {
    const instance = new MultiMath()
    instance.has_wasm = () => false

    instance.use(unsharp_mask_plugin).init()

    assert.equal(instance.unsharp_mask, unsharp_mask_plugin.fn)
  })

  it('.init() with wasm:false', function () {
    const instance = new MultiMath({ wasm: false, js: true })

    instance.use(unsharp_mask_plugin).init()

    assert.equal(instance.unsharp_mask, unsharp_mask_plugin.fn)
  })
})
