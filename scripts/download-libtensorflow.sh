#!/bin/sh

# Build new package:
# `bazel build //tensorflow/tools/lib_package:libtensorflow`

CPU_DARWIN="https://storage.googleapis.com/tensorflow/libtensorflow/libtensorflow-cpu-darwin-x86_64-1.8.0.tar.gz"
CPU_LINUX="https://storage.googleapis.com/tensorflow/libtensorflow/libtensorflow-cpu-linux-x86_64-1.8.0.tar.gz"
GPU_LINUX="https://storage.googleapis.com/tensorflow/libtensorflow/libtensorflow-gpu-linux-x86_64-1.8.0.tar.gz"

target=""
platform=$1
if [ "$platform" = "linux-cpu" ]
then
  target=$CPU_LINUX
elif [ "$platform" = "linux-gpu" ]
then
  target=$GPU_LINUX
elif [ "$platform" = "darwin" ]
then
  target=$CPU_DARWIN
else
  echo "Please submit a valid platform"
  exit 1
fi

TARGET_DIRECTORY="deps/tensorflow/"
LIBTENSORFLOW="lib/libtensorflow.so"

mkdir -p $TARGET_DIRECTORY

# Ensure that at least libtensorflow.so is downloaded.
if [ ! -e "$TARGET_DIRECTORY${LIBTENSORFLOW}" ]
then
  curl -L \
    $target |
    tar -C $TARGET_DIRECTORY -xz
fi
