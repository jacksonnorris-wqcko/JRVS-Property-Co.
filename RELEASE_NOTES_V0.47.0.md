# JRVS Property Co. V0.47.0 — Data Integrity

No database schema changes. No visible layout changes. Existing data is preserved.

## Fixed
- **Duplicate invoice/quote/job numbers.** The check that stops a number being reused used a broken pattern and never matched. Fixed. Sync now also takes the highest counter from either device and reports any duplicate numbers it finds.
- **Deleted records coming back after sync.** Deleting a job, client, quote, invoice, transaction, package, calendar event or photo is now remembered ("tombstone") and respected on every device. A record edited *after* the deletion on another device is kept.
- **Edits not timestamped.** Every create/edit is now timestamped automatically on save, so sync can pick the newest version instead of treating most edits as conflicts. Existing records are not restamped on upgrade.
- **Invoices were not being merged by sync** (the local copy overwrote the cloud copy). Invoices now merge like quotes.
- **Cleared dashboard alerts were wiped by sync.** They are now merged.
- **Screen showed pre-sync data after sync, and the next save overwrote the merged result.** Memory is now refreshed after a successful sync.
- **IDs based on the clock** (`Date.now()`) could collide. New records use random unique IDs. Existing IDs are unchanged.
- **GST and totals are rounded to whole cents** when a quote is saved.

## Test checklist
1. Create an invoice on device A and one on device B before syncing, then sync both. Both should appear; if numbers clash the sync message reports it.
2. Delete a job on device A, sync A, then sync B. It should disappear from B and stay gone.
3. Edit a client on B, sync, then sync A. A should show the edit immediately without reloading.
4. Create a quote with items totalling an awkward amount (e.g. 3 x $33.33, GST exclusive) and confirm GST and total are whole cents.
5. Dismiss a dashboard alert, sync, reload. It should stay dismissed.

## Known limits (unchanged)
- Two devices can still issue the same number while offline; sync now detects and reports it but does not renumber issued documents.
- Photos deleted in the app are removed from both devices' libraries but the file is left in cloud storage (sync still never deletes cloud files).
