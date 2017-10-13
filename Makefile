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
	$(BINARYEN_ROOT)/bin/wasm-opt ./lib/$(MODULE)/$(MODULE).wast -o ./lib/$(MODULE)/$(MODULE).wasm
	node ./support/wasm_wrap.js ./lib/$(MODULE)/$(MODULE).wasm ./lib/$(MODULE)/$(MODULE)_wasm_base64.js

wasm_module_llvm:
	@## run ./support/llvm_install.sh to install
	~/llvmwasm/bin/clang -emit-llvm --target=wasm32 -O3 -c -o ./lib/$(MODULE)/$(MODULE).bc ./lib/$(MODULE)/$(MODULE).c
	~/llvmwasm/bin/llc -asm-verbose=false -o ./lib/$(MODULE)/$(MODULE).s ./lib/$(MODULE)/$(MODULE).bc
	~/llvmwasm/bin/s2wasm --import-memory ./lib/$(MODULE)/$(MODULE).s > ./lib/$(MODULE)/$(MODULE).wast
	~/llvmwasm/bin/wasm-opt ./lib/$(MODULE)/$(MODULE).wast -O3 -o ./lib/$(MODULE)/$(MODULE).wasm
	rm ./lib/$(MODULE)/$(MODULE).bc
	rm ./lib/$(MODULE)/$(MODULE).s
	node ./support/wasm_wrap.js ./lib/$(MODULE)/$(MODULE).wasm ./lib/$(MODULE)/$(MODULE)_wasm_base64.js

wasm_detect:
	~/llvmwasm/bin/clang -emit-llvm --target=wasm32 -O3 -c -o ./support/wa_detect/detect.bc ./support/wa_detect/detect.c
	~/llvmwasm/bin/llc -asm-verbose=false -o ./support/wa_detect/detect.s ./support/wa_detect/detect.bc
	~/llvmwasm/bin/s2wasm --import-memory ./support/wa_detect/detect.s > ./support/wa_detect/detect.wast
	~/llvmwasm/bin/wasm-opt ./support/wa_detect/detect.wast -O3 -o ./support/wa_detect/detect.wasm
	rm ./support/wa_detect/detect.bc
	rm ./support/wa_detect/detect.s
	node ./support/wasm_wrap.js ./support/wa_detect/detect.wasm ./support/wa_detect/detect_wasm_base64.js


.PHONY: publish lint doc
.SILENT: help lint
