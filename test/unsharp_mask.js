'use strict';

const assert      = require('assert');
const mathlib_raw = require('../');


function fill(target, arr) {
  if (!Array.isArray(arr)) arr = [ arr ];

  for (let i = 0; i < target.length; i++) target[i] = arr[i % arr.length];
}


describe('unsharp_mask', function () {

  describe('glur_mono16', function () {

    it('js', function () {
      const glur_js = require('glur/mono16');

      let sample = new Uint16Array(100 * 100);

      fill(sample, 33333);

      let orig = sample.slice(0, sample.length);

      glur_js(sample, 100, 100, 2);

      assert.deepEqual(sample, orig);
    });


    it('wasm', function () {
      const glur_js   = require('glur/mono16');
      const glur_wasm = require('./glur_mono16_wasm');
      const mlib_wasm = mathlib_raw({ js: false }).use(require('../lib/unsharp_mask'));

      return mlib_wasm.init().then(function () {
        let sample = new Uint16Array(100 * 100);
        fill(sample, [ 0, 255 ]);

        let sample_js   = sample.slice(0, sample.length);
        let sample_wasm = sample.slice(0, sample.length);

        glur_js(sample_js, 100, 100, 2);

        let blur_wasm = glur_wasm(mlib_wasm, sample_wasm, 100, 100, 2);

        assert.deepEqual(sample_js, blur_wasm);
      });
    });
  });


  describe('unsharp_mask', function () {

    function createSample(width, height) {
      const result = new Uint8Array(width * height * 4);

      for (let i = 0; i < result.length; i++) result[i] = 20 + i;

      return result;
    }


    it('js should not throw without wasm', function () {
      const mlib = mathlib_raw({ wasm: false }).use(require('../lib/unsharp_mask'));

      let sample = createSample(100, 100);
      mlib.unsharp_mask(sample, 100, 100, 80, 2, 2);
    });


    it('wasm', function () {
      const mlib_js = mathlib_raw({ wasm: false }).use(require('../lib/unsharp_mask'));
      const mlib_wasm = mathlib_raw({ js: false }).use(require('../lib/unsharp_mask'));

      return mlib_wasm.init().then(function () {
        let sample_js   = createSample(100, 100);
        let sample_wasm = createSample(100, 100);

        mlib_js.unsharp_mask(sample_js, 100, 100, 80, 2, 2);
        mlib_wasm.unsharp_mask(sample_wasm, 100, 100, 80, 2, 2);

        assert.deepEqual(sample_js, sample_wasm);
      });
    });
  });
});
