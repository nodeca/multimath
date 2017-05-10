'use strict';

const assert      = require('assert');
const mathlib_raw = require('../');

function createFixture(width, height) {
  const result = new Uint8Array(width * height * 4);

  for (let i = 0; i < result.length; i++) {
    result[i] = 20 + i;
  }

  return result;
}

function compareArrays(arr1, arr2, maxdiff) {
  var diff = 0;

  if (arr1.length != arr2.length) {
    assert.fail('Array compare failed');
  }

  for (let i = 0; i < arr1.length; i++) {
    diff = Math.abs(arr1[i] - arr2[i]);
    if (diff > maxdiff) {
      assert.fail('Array compare failed');
    }
  }
}

function createFixtureConst(width, height, number) {
  const result = new Uint16Array(width * height);

  for (let i = 0; i < width * height; i++) {
    result[i] = number;
  }

  return result;
}

function createFixtureGlur(width, height) {
  const result = new Uint16Array(width * height);

  for (let i = 0; i < width * height; i++) {
    if (i % 2) {
      result[i] = 0;
    }
    else {
      result[i] = 255;
    }
  }

  return result;
}

describe('glur_mono16', function () {
  it('js', function () {
    var glur_js = require('glur/mono16');
    let fixture = createFixtureConst(100, 100, 33333);
    glur_js(fixture, 100, 100, 2);

    for (let i = 0; i < fixture.length; i++) {
      assert.equal(fixture[i], 33333);
    }
  });

  it('wasm', function () {
    var glur_js = require('glur/mono16');
    var glur_wasm = require('./glur_mono16_wasm');
    const mlib_wasm = mathlib_raw({ js: false }).use(require('../lib/unsharp_mask'));

    return mlib_wasm.init().then(function () {
      var fixturejs = createFixtureGlur(100, 100);
      glur_js(fixturejs, 100, 100, 2);

      var fixture = createFixtureGlur(100, 100);
      var blur_wasm = glur_wasm(mlib_wasm, fixture, 100, 100, 2);

      compareArrays(fixturejs, blur_wasm, 1);
    });
  });
});

describe('unsharp_mask', function () {
  it('js', function () {
    const mlib = mathlib_raw({ wasm: false }).use(require('../lib/unsharp_mask'));

    let fixture = createFixture(100, 100);
    mlib.unsharp_mask(fixture, 100, 100, 80, 2, 2);
  });

  it('wasm', function () {
    const mlib_js = mathlib_raw({ wasm: false }).use(require('../lib/unsharp_mask'));
    const mlib_wasm = mathlib_raw({ js: false }).use(require('../lib/unsharp_mask'));

    return mlib_wasm.init().then(function () {
      let fixture_js = createFixture(100, 100);
      mlib_js.unsharp_mask(fixture_js, 100, 100, 80, 2, 2);

      let fixture_wasm = createFixture(100, 100);
      var masked = mlib_wasm.unsharp_mask(fixture_wasm, 100, 100, 80, 2, 2);

      compareArrays(fixture_js, masked, 1);
    });
  });
});
