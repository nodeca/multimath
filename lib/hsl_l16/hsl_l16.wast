(module
 (import "env" "memory" (memory $0 1))
 (table 0 anyfunc)
 (export "hsl_l16" (func $hsl_l16))
 (func $hsl_l16 (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (set_local $8
   (i32.mul
    (get_local $1)
    (get_local $0)
   )
  )
  (set_local $9
   (i32.const 0)
  )
  (set_local $10
   (i32.const 0)
  )
  (block $label$0
   (loop $label$1
    (br_if $label$0
     (i32.lt_s
      (get_local $8)
      (i32.const 1)
     )
    )
    (set_local $6
     (i32.and
      (tee_local $4
       (i32.shr_u
        (tee_local $1
         (i32.load
          (get_local $10)
         )
        )
        (i32.const 16)
       )
      )
      (i32.const 255)
     )
    )
    (block $label$2
     (block $label$3
      (br_if $label$3
       (tee_local $7
        (i32.lt_u
         (tee_local $0
          (i32.and
           (get_local $1)
           (i32.const 255)
          )
         )
         (tee_local $5
          (i32.and
           (tee_local $3
            (i32.shr_u
             (get_local $1)
             (i32.const 8)
            )
           )
           (i32.const 255)
          )
         )
        )
       )
      )
      (set_local $11
       (get_local $1)
      )
      (br_if $label$2
       (i32.ge_u
        (get_local $0)
        (get_local $6)
       )
      )
     )
     (set_local $11
      (select
       (get_local $4)
       (select
        (get_local $4)
        (get_local $3)
        (i32.lt_u
         (get_local $5)
         (get_local $0)
        )
       )
       (i32.lt_u
        (get_local $5)
        (get_local $6)
       )
      )
     )
    )
    (set_local $11
     (i32.and
      (get_local $11)
      (i32.const 255)
     )
    )
    (block $label$4
     (block $label$5
      (br_if $label$5
       (i32.gt_u
        (get_local $0)
        (get_local $5)
       )
      )
      (br_if $label$4
       (i32.le_u
        (get_local $0)
        (get_local $6)
       )
      )
     )
     (set_local $1
      (select
       (get_local $4)
       (select
        (get_local $4)
        (get_local $3)
        (get_local $7)
       )
       (i32.gt_u
        (get_local $5)
        (get_local $6)
       )
      )
     )
    )
    (set_local $1
     (i32.and
      (i32.shr_u
       (tee_local $0
        (i32.mul
         (i32.add
          (i32.and
           (get_local $1)
           (i32.const 255)
          )
          (get_local $11)
         )
         (i32.const 257)
        )
       )
       (i32.const 1)
      )
      (i32.const 65535)
     )
    )
    (block $label$6
     (br_if $label$6
      (i32.eqz
       (get_local $2)
      )
     )
     (set_local $1
      (i32.or
       (i32.shl
        (get_local $1)
        (i32.const 8)
       )
       (i32.and
        (i32.shr_u
         (get_local $0)
         (i32.const 9)
        )
        (i32.const 255)
       )
      )
     )
    )
    (set_local $8
     (i32.add
      (get_local $8)
      (i32.const -1)
     )
    )
    (set_local $10
     (i32.add
      (get_local $10)
      (i32.const 4)
     )
    )
    (i32.store16
     (get_local $9)
     (get_local $1)
    )
    (set_local $9
     (i32.add
      (get_local $9)
      (i32.const 2)
     )
    )
    (br $label$1)
   )
  )
 )
)
;; METADATA: { "asmConsts": {},"staticBump": 12, "initializers": [] }
