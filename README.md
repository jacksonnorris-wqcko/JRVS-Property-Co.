# JRVS Property Co. V0.1.5.1 Hotfix

This is a logo-rendering hotfix for V0.1.5 Document Generation. The approved JRVS logo is embedded directly in quotation and invoice print documents, avoiding broken relative image paths in the browser print window.

## Install
Upload and replace the files in the repository root with the contents of this ZIP. Keep using the same GitHub Pages URL and browser profile.

## Data preservation
This hotfix does not clear, migrate, or overwrite `jrvs-data` localStorage or the `jrvs-photo-library` IndexedDB database.

## Verification
The logo is embedded as a compact JPEG data URI in the document template. Version metadata and service-worker cache are updated to 0.1.5.1.
