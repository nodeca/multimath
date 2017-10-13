(module
 (import "env" "memory" (memory $0 1))
 (table 0 anyfunc)
 (export "detect" (func $detect))
 (func $detect (result i32)
  (i32.const 1)
 )
)
