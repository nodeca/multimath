#!/usr/bin/env node
'use strict';

/* eslint-disable no-console */

const fs   = require('fs');


if (process.argv.length !== 3) {
  console.log(`Patch memory limit in wast file, 256 -> 1, until emsdk fixed

Usage: wasm_wrap.js target_file.wast
`);
  process.exit(1);
}


if (!fs.existsSync(process.argv[2])) {
  console.log(`Can not read file: '${process.argv[2]}'`);
  process.exit(1);
}

const wasm = fs.readFileSync(process.argv[2], 'utf-8');

const RE = /\(memory \$0 256\)/;

if (!RE.test(wasm)) {
  console.log("Can not find pattern '(memory $0 256)' to patch");
  process.exit(1);
}

fs.writeFileSync(process.argv[2], wasm.replace(RE, '(memory $0 1)'));
