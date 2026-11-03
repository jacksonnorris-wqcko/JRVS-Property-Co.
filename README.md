# JRVS Property Co. — V0.1.5 Beta

## Document generation
- Generate print-ready, A4 quotation documents and save them as PDFs using the browser print dialog.
- Convert accepted quotations into invoices (one invoice per quotation).
- Invoice due date defaults to 14 days after issue; mark invoices as paid and filter unpaid/overdue records.
- Documents use the approved JRVS Property Co. branding and the existing client/job details.

## Install/update
Upload all six files/folders from this ZIP into the root of the existing GitHub repository, replacing matching files. Keep using the same GitHub Pages URL and browser profile.

## Data safety
This release is built from V0.1.4.2. It retains the existing `jrvs-data` localStorage record and `jrvs-photo-library` IndexedDB photo store. It adds an `invoices` array inside the existing `jrvs-data` object. It does not clear browser storage or delete photos. Continue to keep backups: cloud sync is not implemented yet.

## PDF notes
PDFs are generated locally through the browser's print dialog. Choose “Save as PDF”. Allow pop-ups for the app if prompted. No documents or photos are uploaded to a server.
