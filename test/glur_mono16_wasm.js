'use strict';


module.exports = function glur16(thisobj, src, width, height, radius) {
  var elem_cnt = width * height;
  var src_byte_cnt = elem_cnt * 2;
  var out_byte_cnt = elem_cnt * 2;
  var tmp_byte_cnt = elem_cnt * 2;
  var line_byte_cnt = Math.max(width, height) * 4; // float32 array
  var coeffs_byte_cnt = 8 * 4;
  var src_offset = 0;
  var out_offset = src_byte_cnt;
  var tmp_offset = src_byte_cnt + out_byte_cnt;
  var line_offset = src_byte_cnt + out_byte_cnt + tmp_byte_cnt;
  var coeffs_offset = src_byte_cnt + out_byte_cnt + tmp_byte_cnt + line_byte_cnt;

  var instance = thisobj.__instance(
    'unsharp_mask',
    src_byte_cnt + out_byte_cnt + tmp_byte_cnt + line_byte_cnt + coeffs_byte_cnt,
    { exp: Math.exp }
  );

  var mem32 = new Uint16Array(thisobj.__memory.buffer);
  mem32.set(src);

  var fn = instance.exports.blurMono16 || instance.exports._blurMono16;

  fn(src_offset, out_offset, tmp_offset, line_offset, coeffs_offset, width, height, radius);

  return new Uint16Array(thisobj.__memory.buffer.slice(out_offset, out_offset + out_byte_cnt));
};
