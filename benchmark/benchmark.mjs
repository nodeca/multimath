#!/usr/bin/env node

import { createRequire } from 'node:module'
import MultiMath from '../index.mjs'
import mm_unsharp from '../lib/unsharp_mask/index.mjs'
import hsl_l16 from '../lib/unsharp_mask/hsl_l16.mjs'
import glur_mono16 from 'glur/mono16.js'

const require = createRequire(import.meta.url)

const mm_js = new MultiMath({ js: true, wasm: false }).use(mm_unsharp)
const mm_wasm = new MultiMath({ js: false, wasm: true }).use(mm_unsharp)

const sample = {
  width: 1024,
  height: 1024
}
sample.buffer = new Uint8Array(sample.width * sample.height * 4)

const suite = require('benchmark').Suite()

suite.add('Init with webassembly modules', {
  defer: true,
  fn: function (defer) {
    new MultiMath({ js: false, wasm: true })
      .use(mm_unsharp)
      .init()
      .then(function () {
        defer.resolve()
      })
  }
})

// //////////////////////////////////////////////////////////////////////////////

suite.add('unsharp_mask js', {
  fn: function () {
    mm_js.unsharp_mask(sample.buffer, sample.width, sample.height, 80, 0.6, 2)
  }
})

suite.add('unsharp_mask wasm', {
  fn: function () {
    mm_wasm.unsharp_mask(sample.buffer, sample.width, sample.height, 80, 0.6, 2)
  }
})

// //////////////////////////////////////////////////////////////////////////////

function hsl_l16_wasm_invoke (src, width, height) {
  const pixels = width * height
  const res_offset = pixels * 4

  const instance = mm_wasm.__instance(
    'unsharp_mask',
    pixels * 4 + pixels * 2,
    { exp: Math.exp }
  )

  const mem = new Uint8Array(mm_wasm.__memory.buffer)
  mem.set(sample)

  const fn = instance.exports.hsl_l16 || instance.exports._hsl_l16

  fn(0, res_offset, width, height)

  // Skip memory copy, because it's not needed in real unsharp
  // var result_wasm = new Uint16Array(mm_wasm.__memory.buffer.slice(res_offset, res_offset + pixels * 2));
}

suite.add('hsl_l16 js', {
  fn: function () {
    hsl_l16(sample.buffer, sample.width, sample.height)
  }
})

suite.add('hsl_l16 wasm', {
  fn: function () {
    hsl_l16_wasm_invoke(sample.buffer, sample.width, sample.height)
  }
})

// //////////////////////////////////////////////////////////////////////////////

const grayscale_sample = new Uint16Array(sample.buffer.length / 2)

function glur16_wasm_invoke (src, width, height, radius) {
  // src = grayscale, 16 bits
  const pixels = width * height

  const src_byte_cnt = pixels * 2
  const out_byte_cnt = pixels * 2
  const tmp_byte_cnt = pixels * 2

  const line_byte_cnt = Math.max(width, height) * 4 // float32 array
  const coeffs_byte_cnt = 8 * 4

  const src_offset = 0
  const out_offset = src_offset + src_byte_cnt
  const tmp_offset = out_offset + out_byte_cnt
  const line_offset = tmp_offset + tmp_byte_cnt
  const coeffs_offset = line_offset + line_byte_cnt

  const instance = mm_wasm.__instance(
    'unsharp_mask',
    coeffs_offset + coeffs_byte_cnt,
    { exp: Math.exp }
  )

  const mem32 = new Uint16Array(mm_wasm.__memory.buffer)
  mem32.set(src)

  const fn = instance.exports.blurMono16 || instance.exports._blurMono16

  fn(src_offset, out_offset, tmp_offset, line_offset, coeffs_offset, width, height, radius)

  // Skip memory copy, because it's not needed in real unsharp
  // return new Uint16Array(mm_wasm.__memory.buffer.slice(out_offset, out_offset + out_byte_cnt));
}

suite.add('glur_mono16 js', {
  fn: function () {
    glur_mono16(grayscale_sample, sample.width, sample.height, 1.5)
  }
})

suite.add('glur_mono16 wasm', {
  fn: function () {
    glur16_wasm_invoke(grayscale_sample, sample.width, sample.height, 1.5)
  }
})

// //////////////////////////////////////////////////////////////////////////////

suite.on('cycle', function (event) {
  console.log('> ' + event.target)
})

suite.run()
