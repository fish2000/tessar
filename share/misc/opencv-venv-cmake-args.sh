#!/usr/bin/env bash

OPENCV_VERSION="2.4.8"

pip install -U numpy scipy
unzip "opencv-${OPENCV_VERSION}.zip"
cd "opencv-${OPENCV_VERSION}"

if [[ -d macbuild ]]; then
    rm -rf macbuild
fi

mkdir macbuild
cd macbuild
cmake .. \
    -DCMAKE_INSTALL_PREFIX=${VIRTUAL_ENV} \
    -DCMAKE_BUILD_TYPE=None \
    -DCMAKE_VERBOSE_MAKEFILE=OFF \
    -Wno-dev \
    -DCMAKE_OSX_DEPLOYMENT_TARGET= \
    -DWITH_CUDA=OFF \
    -DBUILD_ZLIB=OFF \
    -DBUILD_TIFF=OFF \
    -DBUILD_PNG=OFF \
    -DBUILD_PNG=OFF \
    -DBUILD_JPEG=OFF \
    -DBUILD_JASPER=OFF \
    -DBUILD_TESTS=OFF \
    -DBUILD_PERF_TESTS=OFF \
    -DWITH_TBB=ON \
    -DWITH_OPENCL=ON \
    -DWITH_FFMPEG=OFF \
    -DWITH_PYTHON=ON \
    -DBUILD_PYTHON_SUPPORT=ON \
    -DPYTHON_LIBRARY=`python-config --prefix`/lib/libpython2.7.dylib \
    -DPYTHON_EXECUTABLE=${VIRTUAL_ENV}/bin/python2.7 \
    -DPYTHON_INCLUDE=${VIRTUAL_ENV}/include/python2.7/ \
    -DPYTHON_PACKAGES_PATH=${VIRTUAL_ENV}/lib/python2.7/site-packages/ \
    -DPYTHON_NUMPY_INCLUDE_DIR=${VIRTUAL_ENV}/lib/python2.7/site-packages/numpy/core/include/ \
    -DENABLE_SSSE3=ON \
    -DENABLE_SSE41=ON \
    -DENABLE_SSE42=ON \
    -DENABLE_AVX=ON \
        && \
        make -j4 \
        && \
        make install