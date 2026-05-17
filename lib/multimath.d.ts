export interface MultiMathPlugin {
  name: string
  fn: (this: MultiMath, ...args: any[]) => any
  wasm_fn?: (this: MultiMath, ...args: any[]) => any
  wasm_src?: string
}

export interface MultiMathOptions {
  js?: boolean
  wasm?: boolean
  modules?: Record<string, MultiMathPlugin>
}

export default class MultiMath {
  constructor(options?: MultiMathOptions)
  has_wasm(): boolean
  use<T extends MultiMathPlugin>(module: T): this & Record<T['name'], T['fn']>
  init(): Promise<this>
  __memory: WebAssembly.Memory | null
  __reallocate(bytes: number): WebAssembly.Memory
  __instance(name: string, memsize: number, env_extra?: Record<string, Function>): WebAssembly.Instance
  __align(number: number, base?: number): number
}
