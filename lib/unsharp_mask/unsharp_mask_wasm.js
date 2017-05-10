'use strict';

function getInstance(thisobj, name, memsize) {
  if (memsize) thisobj.__reallocate(memsize);

  if (!thisobj.__cache[name]) {
    thisobj.__cache[name] = new WebAssembly.Instance(thisobj.__wasm[name], {
      env: {
        memoryBase: 0,
        memory: thisobj.__memory,
        tableBase: 0,
        table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        exp: Math.exp
      }
    });
  }
  return thisobj.__cache[name];
}

function hsl_l16_wasm(thisobj, src, width, height) {
  var instance = getInstance(thisobj, 'unsharp_mask', src.length);

  //
  // Fill memory block with data to process
  //

  // 32-bit copy is much faster in chrome
  var src32 = new Uint32Array(src.buffer);
  var mem32 = new Uint32Array(thisobj.__memory.buffer);
  mem32.set(src32);

  // emsdk adds _ to exported fn name, llvm exports as is
  // try both
  var fn = instance.exports.hsl_l16 || instance.exports._hsl_l16;

  fn(width, height, !thisobj.__isLE);

  // That will not work with BE, but we will drop this anyway.
  return new Uint16Array(thisobj.__memory.buffer.slice(0, width * height * 2));
};

function glur16_wasm(thisobj, src, width, height, radius) {
  var elem_cnt = width * height;
  var src_byte_cnt = elem_cnt * 2;
  var out_byte_cnt = elem_cnt * 2;
  var tmp_byte_cnt = elem_cnt * 2;
  var line_byte_cnt = Math.max(width, height) * 4; // float32 array
  var coeffs_byte_cnt = 8 * 4;
  var out_offset = src_byte_cnt;
  var tmp_offset = src_byte_cnt + out_byte_cnt;
  var line_offset = src_byte_cnt + out_byte_cnt + tmp_byte_cnt;
  var coeffs_offset = src_byte_cnt + out_byte_cnt + tmp_byte_cnt + line_byte_cnt;

  var instance = getInstance(thisobj, 'unsharp_mask', src_byte_cnt + out_byte_cnt + tmp_byte_cnt + line_byte_cnt + coeffs_byte_cnt);

  var mem32 = new Uint16Array(thisobj.__memory.buffer);
  mem32.set(src);

  var fn = instance.exports.blurMono16 || instance.exports._blurMono16;

  fn(out_offset, tmp_offset, line_offset, coeffs_offset, width, height, radius);

  return new Uint16Array(thisobj.__memory.buffer.slice(out_offset, out_offset + out_byte_cnt));
}

function unsharp_wasm(thisobj, img, lightness, blured, width, height, amount, threshold) {
  var elem_cnt = width * height;
  var img_bytes_cnt = elem_cnt * 4;
  var lightness_bytes_cnt = elem_cnt * 2;
  var blur_bytes_cnt = elem_cnt * 2;
  var lightness_offset = img_bytes_cnt;
  var blur_offset = img_bytes_cnt + lightness_bytes_cnt;

  var instance = getInstance(thisobj, 'unsharp_mask', img_bytes_cnt + lightness_bytes_cnt + blur_bytes_cnt);

  var mem32 = new Uint16Array(thisobj.__memory.buffer);
  mem32.set(new Uint16Array(img.buffer));
  mem32.set(lightness, lightness_offset / 2);
  mem32.set(blured, blur_offset / 2);

  var fn = instance.exports.unsharp || instance.exports._unsharp;

  fn(lightness_offset, blur_offset, width, height, amount, threshold);

  return new Uint8Array(thisobj.__memory.buffer.slice(0, img_bytes_cnt));
}

module.exports = function unsharp(img, width, height, amount, radius, threshold) {
  if (amount === 0 || radius < 0.5) {
    return;
  }

  if (radius > 2.0) {
    radius = 2.0;
  }

  var lightness = hsl_l16_wasm(this, img, width, height);
  var blured = glur16_wasm(this, lightness, width, height, radius);

  return unsharp_wasm(this, img, lightness, blured, width, height, amount, threshold);
}
