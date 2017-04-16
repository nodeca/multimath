#!/usr/bin/env node

/* eslint-disable no-console */

'use strict';


var Benchmark     = require('benchmark');
var multimath_raw = require('../');


var mm_js = multimath_raw({ js: true, wasm: false })
  .use(require('../lib/hsl_l16'))
  .use(require('../lib/unsharp_mask'));


var mm_wasm = multimath_raw({ js: false, wasm: true })
  .use(require('../lib/hsl_l16'))
  .use(require('../lib/unsharp_mask'));


var sample = {
  width:  3200,
  height: 2500
};
sample.buffer    = new Uint8Array(sample.width * sample.height * 4);


/* eslint-disable new-cap */
var suite = Benchmark.Suite();

suite.add('Init with webassembly modules', {
  defer: true,
  fn: function (defer) {
    multimath_raw({ js: false, wasm: true })
      .use(require('../lib/hsl_l16'))
      .init()
      .then(function () {
        defer.resolve();
      });
  }
});

suite.add('hsl_l16 js', {
  fn: function () {
    mm_js.hsl_l16(sample.buffer, sample.width, sample.height);
  }
});

suite.add('hsl_l16 wasm', {
  defer: true,
  fn: function (defer) {
    mm_wasm
      .init()
      .then(function () {
        mm_wasm.hsl_l16(sample.buffer, sample.width, sample.height);
        defer.resolve();
      });
  }
});


var glur_mono16 = require('glur/mono16');

suite.add('glur_mono16 js', {
  fn: function () {
    glur_mono16(sample.buffer, sample.width, sample.height, 1.5);
  }
});

/*suite.add('glur_mono16 wasm', {
  defer: true,
  fn: function (defer) {
    mm_wasm
      .init()
      .then(function () {
        mm_wasm.glur_mono16(sample.buffer, sample.width, sample.height, 1.5);
        defer.resolve();
      });
  }
});*/

suite.add('unsharp_mask js', {
  fn: function () {
    mm_js.unsharp_mask(sample.buffer, sample.width, sample.height, 80, 0.6, 2);
  }
});

/*suite.add('unsharp_mask wasm', {
  defer: true,
  fn: function (defer) {
    mm_wasm
      .init()
      .then(function () {
        mm_wasm.unsharp_mask(sample.buffer, sample.width, sample.height, 80, 0.6, 2);
        defer.resolve();
      });
  }
});*/

suite.on('cycle', function (event) {
  console.log('> ' + event.target);
});

suite.run();
