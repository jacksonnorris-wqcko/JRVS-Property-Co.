# JRVS Property Co. — V0.1.4.2 Stability Hotfix

## Stability changes
- Rebuilt from the last known working V0.1.3.1 baseline.
- Original Jobs, Clients, Photos, Pricing & Quotes, Finance and Settings page/navigation code retained.
- Global search functions are placed outside the `showPage` navigation function.
- Removed Ctrl+K/Cmd+K shortcut; browser shortcuts are not intercepted.
- Corrected finance search actions to call `editFinance(recordId, type)` in the correct order.
- Search does not write, migrate, clear or reset app data.

## Data preservation
- Existing `jrvs-data` localStorage key retained.
- Existing IndexedDB photo database retained.
- No `localStorage.clear()`, database deletion or schema migration is included.
- Use the same GitHub Pages URL and browser profile/device to access browser-local records.

## Install
Replace the repository files with the contents of this ZIP.
