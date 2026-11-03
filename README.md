# JRVS Property Co. — V0.0.3 Beta

Upload the contents of this folder to the root of the existing GitHub repository, replacing matching files. Keep the assets folder.

## New photo library
- Import multiple image files into a selected job.
- View job-linked photo thumbnails and full previews.
- Mark imports as Original or Edited.
- Track statuses: Imported, Selected, Editing, Edited, Delivered.
- Delete individual photo records.
- Photo image blobs are stored in IndexedDB on the current browser/device.

## Existing data
The existing `jrvs-data` localStorage key and jobs/clients are retained. Photos use a separate IndexedDB database `jrvs-photo-library`.

## Automatic updates
Version 0.0.3 appears in the UI and version.json; service-worker cache is `jrvs-property-co-v0.0.3`. After publishing, reopen the site. Updates are checked on load and when the tab becomes visible.

## Limitations
This is local device storage, not cloud sync or backup. Keep camera originals backed up separately. This release organises and previews images; pixel editing, ZIP packages and email delivery are future features.
