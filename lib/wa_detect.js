// Detect WebAssembly support.
// - Check global WebAssembly object
// - Try to load simple module (can be disabled via CSP)
//
'use strict';


var base64decode = require('./base64decode');

// See support/wa_detect/detect.c
// Dummy module with `function detect() { return 1; }`
var detector_src = 'AGFzbQEAAAABBQFgAAF/Ag8BA2VudgZtZW1vcnkCAAEDAgEABAQBcAAABwoBBmRldGVjdAAACQEACgYBBABBAQs=';


var wa;


module.exports = function hasWebAssembly() {
  // use cache if called before;
  if (typeof wa !== 'undefined') return wa;

  wa = false;

  if (typeof WebAssembly === 'undefined') return wa;

  // If WebAssenbly is disabled, code can throw on compile
  try {
    var module = new WebAssembly.Module(base64decode(detector_src));

    var env = {
      memoryBase: 0,
      memory:     new WebAssembly.Memory({ initial: 1 }),
      tableBase:  0,
      table:      new WebAssembly.Table({ initial: 0, element: 'anyfunc' })
    };

    var instance = new WebAssembly.Instance(module, { env: env });
    var detect = instance.exports.detect;

    if (detect() === 1) wa = true;

    return wa;
  } catch (__) {}

  return wa;
};
