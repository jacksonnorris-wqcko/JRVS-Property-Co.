# JRVS Property Co. V0.2.1.1 – Safer Cloud Sync Foundation

## Deploy
Extract this ZIP and upload its contents into the root of the existing GitHub repository, replacing matching files. Do not upload the ZIP itself or create a nested folder. Keep the existing GitHub Pages URL and browser profile. Do not clear browser/site data or uninstall the Home Screen app.

## Supabase
The SQL setup was already run for the previous V0.2.1 foundation. This release uses the same table and private storage bucket, so you do not need to run the SQL again. In Supabase Authentication > URL Configuration, the Site URL should be `https://jacksonnorris-wqcko.github.io/JRVS-Property-Co-/` and Email sign-in should be enabled.

## First use
1. Open JRVS Settings > JRVS Cloud Sync on your desktop.
2. Create your account, confirm the email if requested, then sign in.
3. Select Sync now. If the cloud is empty, this creates the first cloud backup from this device.
4. Sign in on your iPhone and select Sync now. If a cloud backup exists, press OK to restore it or Cancel to make no changes.

## Safety behaviour in this release
- Existing cloud snapshots are never overwritten by this release.
- Restore downloads and verifies all cloud photos before changing local business records.
- Restore saves the current business data and calendar in a local pre-restore backup key before applying cloud data.
- Existing local photos are never cleared or overwritten; missing cloud photos are added.
- If a photo download fails, the business data and calendar are not changed.
- Sync is manual. This is a first-backup/restore foundation, not continuous two-way sync. Do not use simultaneous editing as a substitute for a proper conflict-resolution system.

## Notes
Local business data keys and the `jrvs-photo-library` IndexedDB database are retained. The Supabase publishable key is intended for browser use; never place a service-role or secret key in this app.
