# Third-party notices

## FlashRaw

V0.41.0 loads the FlashRaw JavaScript/WebAssembly RAW decoder at runtime from the `flashraw` npm package via esm.sh.

Project: https://github.com/ybouane/flashraw
Package: https://www.npmjs.com/package/flashraw
License: MIT OR Apache-2.0 (see the upstream project for the complete license texts and notices).

The FlashRaw runtime is not bundled into this ZIP. It is downloaded by the browser on first RAW use and cached by the service worker where browser caching rules permit.
