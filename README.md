# JRVS Property Co. — V0.16.0

## Canon CR2 and camera RAW support

- Added in-browser RAW decoding using LibRaw-Wasm (WebAssembly).
- CR2 and the other RAW extensions already accepted by the import picker can now be decoded to gallery previews and project cover thumbnails.
- RAW files are retained unchanged as the original photo record; the JPEG preview is stored separately in the local photo library.
- Opening a RAW original in Photo Studio develops a full-resolution JPEG working image from the RAW file. Saving creates a separate edited JPEG; the original RAW file remains untouched and can still be downloaded or included in delivery ZIPs.
- RAW decoding runs locally in the browser. The decoder module is loaded from jsDelivr on first use, so an internet connection is required when the decoder is first needed. The original photo file is not uploaded to the decoder service.
- RAW preview JPEGs are local derived data and are deliberately excluded from Supabase photo metadata; a device can regenerate them from the synced original RAW file.
- Existing jobs, clients, quotes, invoices, localStorage keys, IndexedDB database/store and Supabase schema are unchanged.

## Important notes
- Full-resolution RAW development can use substantial memory and take longer than JPEG opening, depending on camera resolution and available RAM.
- This is RAW decoding and raster editing, not a full parametric RAW workflow. White balance and demosaicing are applied during development; editor changes are made to the developed working image.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Keep the existing browser profile and app URL. Do not clear site data.

## Release version
- App version: `0.16.0`
- `version.json`: `0.16.0`
- Service-worker cache: `jrvs-property-co-v0.16.0`
