'use strict';


const assert      = require('assert');
const mathlib_raw = require('../');


function createFixture(width, height) {
  const result = new Uint8Array(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    result[i * 4 + 0] = 255; // r
    result[i * 4 + 1] = 180; // g
    result[i * 4 + 2] = 55;  // b
    result[i * 4 + 3] = 0;   // a
  }

  return result;
}


describe('hsl_l16', function () {
  it('js', function () {
    const mlib = mathlib_raw({ wasm: false }).use(require('../lib/hsl_l16'));

    let fixture = createFixture(100, 100);
    let lightness = mlib.hsl_l16(fixture, 100, 100);

    for (let i = 0; i < lightness.length; i++) {
      assert.equal(lightness[i], 39835);
    }
  });


  it('wasm', function () {
    const mlib_js = mathlib_raw({ wasm: false }).use(require('../lib/hsl_l16'));
    const mlib_wasm = mathlib_raw({ js: false }).use(require('../lib/hsl_l16'));

    return mlib_wasm.init().then(function () {
      let fixture, l_js, l_wasm;

      fixture = createFixture(100, 100);

      l_js   = mlib_js.hsl_l16(fixture, 100, 100);
      l_wasm = mlib_wasm.hsl_l16(fixture, 100, 100);

      assert.deepEqual(l_js, l_wasm);

      fixture = createFixture(3200, 2400);

      l_js   = mlib_js.hsl_l16(fixture, 3200, 2400);
      l_wasm = mlib_wasm.hsl_l16(fixture, 3200, 2400);

      assert.deepEqual(l_js, l_wasm);
    });
  });
});
