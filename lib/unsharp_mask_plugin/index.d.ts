import type MultiMath from '../multimath.js'

type UnsharpFn = (
  this: MultiMath,
  img: Uint8Array,
  width: number,
  height: number,
  amount: number,
  radius: number,
  threshold: number
) => void

declare const unsharp_mask_plugin: {
  name: 'unsharp_mask'
  fn: UnsharpFn
  wasm_fn: UnsharpFn
  wasm_src: string
}

export default unsharp_mask_plugin
