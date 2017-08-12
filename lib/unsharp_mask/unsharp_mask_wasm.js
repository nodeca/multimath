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

module.exports = function unsharp(img, width, height, amount, radius, threshold) {
  if (amount === 0 || radius < 0.5) {
    return;
  }

  if (radius > 2.0) {
    radius = 2.0;
  }

  var elem_cnt = width * height;
  var img_bytes_cnt = elem_cnt * 4;
  var hsl_bytes_cnt = elem_cnt * 2;
  var blur_bytes_cnt = elem_cnt * 2;
  var blur_line_byte_cnt = Math.max(width, height) * 4; // float32 array
  var blur_coeffs_byte_cnt = 8 * 4; // float32 array
  var img_offset = 0;
  var hsl_offset = img_bytes_cnt;
  var blur_offset = hsl_offset + hsl_bytes_cnt;
  var blur_tmp_offset = blur_offset + blur_bytes_cnt;
  var blur_line_offset = blur_tmp_offset + blur_bytes_cnt;
  var blur_coeffs_offset = blur_line_offset + blur_line_byte_cnt;

  var instance = getInstance(this, 'unsharp_mask',
    img_bytes_cnt + hsl_bytes_cnt + blur_bytes_cnt * 2 + blur_line_byte_cnt + blur_coeffs_byte_cnt);

  // 32-bit copy is much faster in chrome
  var img32 = new Uint32Array(img.buffer);
  var mem32 = new Uint32Array(this.__memory.buffer);
  mem32.set(img32);

  // HSL
  var fn = instance.exports.hsl_l16 || instance.exports._hsl_l16;
  fn(img_offset, hsl_offset, width, height);

  // BLUR
  fn = instance.exports.blurMono16 || instance.exports._blurMono16;
  fn(hsl_offset, blur_offset, blur_tmp_offset,
    blur_line_offset, blur_coeffs_offset, width, height, radius);

  // UNSHARP
  fn = instance.exports.unsharp || instance.exports._unsharp;
  fn(img_offset, img_offset, hsl_offset,
    blur_offset, width, height, amount, threshold);

  img.set(new Uint8Array(this.__memory.buffer.slice(0, img_bytes_cnt)));
};
