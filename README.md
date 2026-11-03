# JRVS Property Co. V0.2.2 – Two-way Additive Cloud Sync

## Install
Upload the contents of this ZIP into the root of the existing GitHub Pages repository and commit. Keep the same repository URL and browser profiles. Do not clear browser/site data or uninstall the iPhone PWA.

## What changed
- Sync now merges new records from both devices instead of restoring the cloud snapshot over the device.
- Business record collections (jobs, clients, quotes, income, expenses, packages and attention-cleared entries) merge by record ID.
- Calendar events merge by ID.
- New local photos upload to the private Supabase bucket; cloud-only photos download and are added without clearing local photos.
- Same-ID records with no reliable newer timestamp are treated as conflicts. The cloud version is retained in the merged dataset and the local conflicting copy is preserved in a localStorage conflict archive named `jrvs-sync-conflicts-*`.
- The cloud row is updated using its previous `updated_at` value as a concurrency guard. If another device changes it during sync, the update is rejected rather than silently overwriting it.

## Important limitations
- This is an additive merge release. Deletions are not synchronised yet; deleting a record on one device does not delete it from the other device/cloud.
- Simultaneous edits to the same record may be saved as a local conflict archive for manual review. They are not automatically reconciled.
- Test with dummy records first. Do not rely on this release as the only copy of important client or business records.
- Photo files are never deleted by sync. Existing local photos are not cleared.

## Supabase
No new SQL is required. V0.2.2 uses the existing `jrvs_user_state` table and private `jrvs-photos` bucket created by the V0.2.1 setup script.
