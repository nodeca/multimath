'use strict';


const assert    = require('assert');
const wa_detect = require('../lib/wa_detect');


describe('Utilities', function () {

  it('wa_detect', function () {
    assert.equal(wa_detect(), true);
    // for coverage
    wa_detect();
  });

});
