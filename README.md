# JRVS Property Co. — V0.0.4 Beta

## What's new
- The Photo Library's **All projects** view now displays one cover image per project instead of every photo.
- Each project card shows its name, client and total photo count.
- Open a project to view its complete photo gallery.
- Set any photo as that project's cover image.
- The first imported photo automatically becomes the default cover.
- If a cover photo is deleted, the next available photo automatically becomes the cover.
- Existing jobs, clients and photo records are retained.

## Install / update
Upload the contents of this ZIP to the root of the existing GitHub Pages repository, replacing the previous files. Keep the same repository and browser profile. The app checks `version.json` for updates and the service worker cache is updated to V0.0.4.

## Important storage note
Jobs and clients remain in browser local storage; photos remain in IndexedDB on that device/browser. This release does not add cloud sync. Do not clear browser site data if you want to keep local records and photographs. Keep independent backups of important originals.
