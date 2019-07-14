2.0.0 / 2019-07-14
------------------

- Change `has_wasm` to support lazy evaluation. This way browser
 will not be tested against wasm support if wasm feature is disabled,
 which prevents CSP report of `unsafe-eval`. #2, #5


1.0.3 / 2018-03-05
------------------

- Improve WebAssembly detection, #4. Workaround for broken WebAssembly in
  IOS 11.2.x Safary/Chrome (Webkit).


1.0.2 / 2017-10-13
------------------

- Fix WebAssembly detection when disabled via CSP, #2.
- Coverage improve.
- Dev deps bump.


1.0.1 / 2017-10-03
------------------

- .__align(): set base = 8 by default.


1.0.0 / 2017-09-30
------------------

- First release.
