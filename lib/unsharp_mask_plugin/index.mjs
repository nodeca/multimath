import fn from './unsharp_mask.mjs'
import wasm_fn from './unsharp_mask_wasm.mjs'
import wasm_src from './unsharp_mask_wasm_base64.mjs'

export default {
  name: 'unsharp_mask',
  fn,
  wasm_fn,
  wasm_src
}
