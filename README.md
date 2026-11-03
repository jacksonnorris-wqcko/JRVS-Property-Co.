# JRVS Property Co. — V0.0.7 Beta

## What's new: Finance foundations
- Record income and business expenses.
- Link transactions to existing jobs.
- Track income as Paid or Unpaid.
- Mark outstanding income as received.
- Categorise income and expenses.
- Summary of income received, outstanding income, expenses and net cash position.
- Filter transaction list by type and payment status.
- Edit and delete transactions.

## Update reliability fix
- Update checks compare numeric version parts and only refresh when the remote version is genuinely newer.
- A one-time guard prevents repeated refresh attempts for the same remote version.
- Removed the service-worker updatefound auto-reload handler, which could contribute to repeated refreshes.
- Service worker cache version advanced to V0.0.7.

## Install
Upload all files in this ZIP to the root of the existing GitHub Pages repository, replacing the previous files. Keep the same browser profile and device.

## Storage and limitations
Jobs, clients, packages, quotes, income and expenses remain in browser local storage. Photos remain in IndexedDB. This release does not add cloud sync, bank feeds, tax reporting or PDF invoices. Keep independent backups of important records.
