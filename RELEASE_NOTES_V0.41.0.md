# JRVS Property Co. — V0.41.0

## Photo Studio: experimental native RAW sensor development

- Introduces FlashRaw WebAssembly as a genuine camera-RAW decoder/developer for supported CR2 and other RAW formats.
- RAW import previews now attempt a real sensor decode and develop to sRGB JPEG; the original RAW file remains stored unchanged.
- Opening a RAW photo in the editor performs a fresh full-resolution sensor decode instead of reusing the reduced import preview.
- Displays whether the editor is using decoded sensor data or the embedded-JPEG fallback, including the fallback reason.
- If the decoder cannot load or a file cannot be decoded, the app falls back to the embedded JPEG preview to keep the workflow usable; it does not claim that fallback is RAW development.
- FlashRaw is loaded from esm.sh on first use. An internet connection is required for the first decoder load; the service worker caches successful CDN responses for subsequent/offline use where the browser permits it.
- Existing V0.40.1 JPEG enhancement pipeline, editing controls, saved edits, jobs, clients, quotes, photo records and storage schemas are retained.

## Important test status

- The integration is a first experimental browser build. It has not yet been validated against the user's actual Canon EOS 600D CR2 file in their deployed GitHub Pages environment.
- Confirm the editor status says `RAW sensor developed` before judging the new RAW path. If it says `Embedded JPEG fallback`, the app is still using the old preview path for that attempt; share the displayed reason.
- Full-resolution RAW decoding is memory-intensive. Close other large images/tabs if the browser runs low on memory.
- First-use decoder download needs internet. The fallback keeps the previous embedded-preview behaviour available.

## Version and deployment

- App version: `0.41.0`
- `version.json`: `0.41.0`
- Service-worker cache: `jrvs-property-co-v0.41.0`
- Deploy the complete ZIP contents to the repository root. Do not clear app data; no data migration or reset is required.
