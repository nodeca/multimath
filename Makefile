help:
	echo "make help       - Print this help"
	echo "make lint       - Lint sources with JSHint"
	echo "make test       - Run tests"


lint:
	./node_modules/.bin/eslint .


test: lint
	./node_modules/.bin/mocha


wasm:
	MODULE=unsharp_mask $(MAKE) wasm_module_llvm

wasm_module:
	emcc ./lib/$(MODULE)/$(MODULE).c -v -g3 -O3 -s WASM=1 -s SIDE_MODULE=1 -s "BINARYEN_TRAP_MODE='allow'" -o ./lib/$(MODULE)/$(MODULE).wasm
	@# Hack - remove memory limit & reassemble
	node ./support/wast_mem_patch.js ./lib/$(MODULE)/$(MODULE).wast
	$(BINARYEN_ROOT)/bin/wasm-opt -O3 ./lib/$(MODULE)/$(MODULE).wast -o ./lib/$(MODULE)/$(MODULE).wasm
	node ./support/wasm_wrap.js ./lib/$(MODULE)/$(MODULE).wasm ./lib/$(MODULE)/$(MODULE)_wasm_base64.js

wasm_module_llvm:
	@##
	@## LLVM seems too buggy. Use emsdk with memory patch hack now
	@##
	@## see DEVELOPMENT.md for install instructions
	~/llvmwasm/bin/clang -emit-llvm --target=wasm32 -Oz -c -o ./lib/$(MODULE)/$(MODULE).bc ./lib/$(MODULE)/$(MODULE).c
	~/llvmwasm/bin/llc -asm-verbose=false -o ./lib/$(MODULE)/$(MODULE).s ./lib/$(MODULE)/$(MODULE).bc
	@## --emscripten-glue needed to allow import memory object
	~/llvmwasm/binaryen/bin/s2wasm --emscripten-glue ./lib/$(MODULE)/$(MODULE).s > ./lib/$(MODULE)/$(MODULE).wast
	@## Seems nothing to optimize after clang, just use to convert wast to wasm
	~/llvmwasm/binaryen/bin/wasm-opt ./lib/$(MODULE)/$(MODULE).wast -o ./lib/$(MODULE)/$(MODULE).wasm
	rm ./lib/$(MODULE)/$(MODULE).bc
	rm ./lib/$(MODULE)/$(MODULE).s
	node ./support/wasm_wrap.js ./lib/$(MODULE)/$(MODULE).wasm ./lib/$(MODULE)/$(MODULE)_wasm_base64.js


.PHONY: publish lint doc
.SILENT: help lint
