# JRVS Property Co. — V0.0.2 Beta

Upload the contents of this folder to the root of your existing GitHub repository, replacing the matching files. Keep the `assets` folder.

## V0.0.2 changes
- Edit and delete jobs and clients.
- View job details.
- View client profiles with linked job history.
- Add property address and client company fields.
- Updated version display, version.json and service-worker cache.

## Existing data
The app retains the same `jrvs-data` browser storage key and existing jobs/clients arrays. It does not intentionally clear local records. Existing jobs without the new address field remain supported.

## Automatic updates
The version is 0.0.2 in the interface and version.json. The service worker cache is `jrvs-property-co-v0.0.2`. After publishing, open the app and allow it to refresh; use Settings → Check now if needed.

This remains a local browser prototype. There is no cloud sync yet. Back up important data.
