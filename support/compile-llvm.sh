#!/bin/bash

set -e -x

clang-11 -o lib/unsharp_mask/unsharp_mask.wasm lib/unsharp_mask/unsharp_mask.c \
  --target=wasm32 --no-standard-libraries -O3 \
  -Wl,--no-entry -Wl,--export-all -Wl,--allow-undefined -Wl,--import-memory

./support/wasm_wrap.js lib/unsharp_mask/unsharp_mask.wasm lib/unsharp_mask/unsharp_mask_wasm_base64.js
