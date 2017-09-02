#!/bin/bash

set -e -x

export WORKDIR=~/llvmwasm
export INSTALLDIR=$WORKDIR

# "stable" branch
LLVM_REVISION=312406
# version 1.37.21
BINARYEN_COMMIT=d621116

#[ -n "$WORKDIR" ] && [ -n "$INSTALLDIR" ] || { echo "WORKDIR and INSTALLDIR should be set"; exit 1; }

sudo apt-get install g++-multilib

mkdir -p $WORKDIR
cd $WORKDIR
svn co http://llvm.org/svn/llvm-project/llvm/trunk@$LLVM_REVISION llvm

cd $WORKDIR/llvm/tools
svn co http://llvm.org/svn/llvm-project/cfe/trunk@$LLVM_REVISION clang

mkdir $WORKDIR/llvm-build
cd $WORKDIR/llvm-build
#cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=$INSTALLDIR -DLLVM_TARGETS_TO_BUILD= -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD=WebAssembly $WORKDIR/llvm
# OPtimizations:
# 1. Minimize size (18gb -> 800mb)
# 2. Use "Gold" linker (reduce memory use)
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX=$INSTALLDIR -DLLVM_TARGETS_TO_BUILD= -DLLVM_EXPERIMENTAL_TARGETS_TO_BUILD=WebAssembly -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_BUILD_TYPE=MinSizeRel $WORKDIR/llvm
make -j $(nproc)
make install

mkdir -p $WORKDIR/binaryen
cd $WORKDIR/binaryen
git init
git fetch https://github.com/WebAssembly/binaryen.git
git checkout $BINARYEN_COMMIT
#cmake .
cmake -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=gold" -DCMAKE_BUILD_TYPE=MinSizeRel -DCMAKE_INSTALL_PREFIX=$INSTALLDIR .
make -j $(nproc)
make install
