// Calculates 16-bit precision HSL lightness from 8-bit rgba buffer
// (wrapper for wasm implementation)
//
'use strict';


module.exports = function hsl_l16_wasm(src, width, height) {
  var instance = this.__instance('hsl_l16', src.length);

  //
  // Fill memory block with data to process
  //

  // 32-bit copy is much faster in chrome
  var src32 = new Uint32Array(src.buffer);
  var mem32 = new Uint32Array(this.__memory.buffer);
  mem32.set(src32);

  // emsdk adds _ to exported fn name, llvm exports as is
  // try both
  var fn = instance.exports.hsl_l16 || instance.exports._hsl_l16;

  fn(width, height, !this.__isLE);

  // That will not work with BE, but we will drop this anyway.
  return new Uint16Array(this.__memory.buffer.slice(0, width * height * 2));
};
