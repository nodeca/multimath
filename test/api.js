'use strict';


const assert    = require('assert');
const wa_detect = require('../lib/wa_detect');
const multimath = require('..');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('Utilities', function () {

  it('wa_detect', function () {
    assert.equal(wa_detect(), true);
    // for coverage
    wa_detect();
  });


  it('throws of both js & wasm are disables', function () {
    assert.throws(function () {
      multimath({ js: false, wasm: false });
    });
  });


  it('.__align()', function () {
    var m = multimath();

    assert(m.__align(8),    8);
    assert(m.__align(3, 4), 4);
    assert(m.__align(3),    8);
    assert(m.__align(5, 4), 8);
    assert(m.__align(5),    8);
  });


  it('.__reallocate()', function () {
    var m = multimath();

    m.__reallocate(1);
    assert.equal(m.__memory.buffer.byteLength, 65536);
    m.__reallocate(100000);
    assert.equal(m.__memory.buffer.byteLength, 131072);
    // coverage
    m.__reallocate(100000);
    assert.equal(m.__memory.buffer.byteLength, 131072);
  });


  it('.__instance()', function () {
    // coverage only
    var m = multimath().use(require('../lib/unsharp_mask'));

    m.__instance('unsharp_mask', 1, { exp: Math.exp });
    m.__instance('unsharp_mask', 1, { exp: Math.exp }); // cached
  });


  it('.init() with default options', function () {
    const hasWebAssembly = sinon.stub().returns(true);

    const multimathMocked = proxyquire('..', {
      './lib/wa_detect': hasWebAssembly
    });

    const instance =  multimathMocked();

    const unsharp_mask = require('../lib/unsharp_mask');

    instance.use(unsharp_mask).init();

    assert.equal(instance.unsharp_mask, unsharp_mask.wasm_fn);

    sinon.assert.callCount(hasWebAssembly, 1);
  });


  it('.init() with default options and not supported wasm', function () {
    const hasWebAssembly = sinon.stub().returns(false);

    const multimathMocked = proxyquire('..', {
      './lib/wa_detect': hasWebAssembly
    });

    const instance =  multimathMocked();

    const unsharp_mask = require('../lib/unsharp_mask');

    instance.use(unsharp_mask).init();

    assert.equal(instance.unsharp_mask, unsharp_mask.fn);

    sinon.assert.callCount(hasWebAssembly, 1);
  });


  it('.init() with wasm:false', function () {
    const hasWebAssembly = sinon.stub().returns(true);

    const multimathMocked = proxyquire('..', {
      './lib/wa_detect': hasWebAssembly
    });

    const instance = multimathMocked({ wasm: false, js: true });

    const unsharp_mask = require('../lib/unsharp_mask');

    instance.use(unsharp_mask).init();

    assert.equal(instance.unsharp_mask, unsharp_mask.fn);

    sinon.assert.callCount(hasWebAssembly, 0);
  });

});
