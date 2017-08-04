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

module.exports = function glur16(thisobj, src, width, height, radius) {
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

  var instance = getInstance(
    thisobj,
    'unsharp_mask',
    src_byte_cnt + out_byte_cnt + tmp_byte_cnt + line_byte_cnt + coeffs_byte_cnt
  );

  var mem32 = new Uint16Array(thisobj.__memory.buffer);
  mem32.set(src);

  var fn = instance.exports.blurMono16 || instance.exports._blurMono16;

  fn(out_offset, tmp_offset, line_offset, coeffs_offset, width, height, radius);

  return new Uint16Array(thisobj.__memory.buffer.slice(out_offset, out_offset + out_byte_cnt));
};
