# JRVS Property Co. — V0.7.0

## Sequential linked numbering

- Added independent sequential five-digit number sequences for jobs, quotations and invoices: `JOB-00000`, `QUO-00000`, `INV-00000`, continuing in numerical order.
- New job numbers are assigned on job creation, quote numbers on quote creation, and invoice numbers when an accepted quote is invoiced.
- Quotes retain their linked job number; invoices retain their quote number and linked job number.
- Converting an accepted quote into a job creates a job number and links it back to the quote.
- Existing internal record IDs and business data are retained. Existing display numbers are migrated into sequential display numbers where needed.
- Counters are saved in `jrvs-data`, never move backwards, and numbers are not reused after deleting records.
- Number sequences stop safely at `99999`.
- No Supabase schema changes.

## Deploying
1. Extract this ZIP.
2. Upload all files and folders inside it to the root of the existing GitHub repository, replacing matching files.
3. Keep the same browser profile and existing app URL. Do not clear site data or reset IndexedDB.

## Release version
- App version: `0.7.0`
- `version.json`: `0.7.0`
- Service-worker cache: `jrvs-property-co-v0.7.0`

## Migration note
On first launch, existing jobs, quotes and invoices receive sequential display numbers if they do not already have one. Existing internal IDs and record links are preserved. Migration is stored in the existing `jrvs-data` localStorage record.
