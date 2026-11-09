# JRVS Property Co. — V0.41.2

## RAW integration repair without rollback

- Fixes a JavaScript parse error introduced in V0.41.0: `openEditor` now correctly supports asynchronous CR2 preview preparation. The prior non-async function contained `await`, which prevented the main application script from parsing.
- Keeps the experimental RAW decoder integration in the codebase.
- Separates the experimental sensor RAW decode from normal photo import and editing.
- CR2 import and editor launch use the embedded JPEG preview first, avoiding network/module dependency during ordinary editing.
- Adds an explicit **Develop RAW (experimental)** editor action for CR2 originals. It only replaces the current editor image when the decoder confirms sensor-developed output; failures leave the existing editor image unchanged.
- Retains the V0.40.1 JPEG enhancement and editor functionality.
- Updates app version and service-worker cache to 0.41.2.
- No database schema or saved-photo data changes.
