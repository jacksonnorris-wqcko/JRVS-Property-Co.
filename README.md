# JRVS Property Co. V0.3.1.1 – List Limits Fix

Corrects V0.3.1 list behaviour. Jobs, clients, service packages, quotes and invoices show the five most recent/matching entries by default. Search reveals up to ten matching entries and displays a count with guidance to refine the search for older records. This avoids unbounded scrolling while keeping records discoverable. Dashboard recent jobs remain limited to five. Upcoming events remain limited to today through the next seven days.

## Install
Extract the ZIP and upload all files/folders into the existing GitHub repository root, replacing matching files. Do not upload the ZIP itself. No SQL changes are required.

## Data safety
This is a UI/list rendering change. It retains the existing localStorage keys, photo IndexedDB database/store, Supabase schema and cloud-sync code from V0.3.1. No records are deleted; items beyond the display limit remain stored and searchable.

## Validation
Static checks only; live browser and Supabase workflows have not been exercised in this build.
