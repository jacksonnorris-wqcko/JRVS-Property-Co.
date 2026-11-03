# JRVS Property Co. — V0.0.6 Beta

## What's new: Pricing & quotations
- Create reusable photography packages and optional extras.
- Edit and delete packages.
- Create quotations linked to an existing client and optionally a job.
- Add package items or custom line items, quantities and unit prices.
- Calculate subtotal, GST and total in AUD.
- GST modes: add 10% GST, prices GST-inclusive, or no GST.
- Quote dates, validity dates, notes and statuses (Draft, Sent, Accepted, Declined).
- Edit, change status and delete saved quotes.
- Quote and package data is saved alongside existing app data in browser local storage.

## Install / update
Upload the contents of this ZIP to the root of the existing GitHub Pages repository, replacing the previous files. Keep the same repository and browser profile. The app checks `version.json` for updates and the service worker cache is updated to V0.0.6.

## Storage and limitations
Jobs, clients, packages and quotes remain in browser local storage. Photos remain in IndexedDB on that device/browser. This release does not add cloud sync, PDF quote generation, invoicing or payment processing. GST settings are calculation options; confirm your business GST registration and tax treatment with an accountant before issuing real quotes.
