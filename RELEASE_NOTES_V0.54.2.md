# JRVS Property Co. Desktop — V0.54.2 Release Notes

## Quotes & invoices · in-app document preview
- Replaced the separate popup window used for quotation and invoice PDF output with an in-app document preview.
- Added a review panel inside the JRVS desktop window, with a **Print / Save PDF** action that opens the Windows print dialog.
- Removed the dependency on browser popup permissions in the Tauri desktop app.
- Kept quote and invoice records, sequential numbering, document layout, branding and payment information unchanged.
- No business data migration or changes to saved records are required.

## Verification note
- CI includes a regression check that quote/invoice document printing uses the in-app preview and does not call `window.open()`.
- Windows installer build and signed updater publication are verified by the V0.54.2 release workflow.
- Installed-app print preview and saving to PDF should be confirmed by the user after updating.
