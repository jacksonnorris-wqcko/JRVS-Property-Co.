# JRVS Property Co. — V0.1.8

## Business Calendar
- Month, week and day calendar views.
- Create, edit and remove manual appointments and tasks.
- Automatically displays dated jobs, quotation expiry dates and unpaid invoice due dates.
- Calendar entries link back to their JRVS source records.
- Upcoming schedule panel on the dashboard.
- Local calendar storage under `jrvs-calendar`.
- Export calendar events as an `.ics` file for import into Apple Calendar, Google Calendar or Outlook.

## Deployment
1. Extract this ZIP.
2. Upload the contents (not the ZIP itself) to the root of the existing GitHub Pages repository, replacing the previous release files.
3. Keep the existing repository and Pages URL.
4. Open the installed JRVS app and allow the update to complete. Check Settings for V0.1.8.

## Data protection
- Existing `jrvs-data` localStorage key is retained.
- Existing `jrvs-photo-library` IndexedDB database and `photos` object store are retained.
- Calendar events use a separate `jrvs-calendar` localStorage key.
- Removing a calendar event does not delete its linked business record.
- No existing records or photos are intentionally cleared or migrated.

## External calendar notes
The `.ics` export is a portable calendar file. This release does not yet implement live OAuth or two-way background synchronisation with Google, Microsoft or Apple accounts. Import the exported file into your preferred calendar application. Two-way provider integrations require a later authenticated sync service and conflict handling.

## Testing
JavaScript syntax and ZIP integrity should be checked before deployment. Browser/device testing is still required for actual calendar interactions and local data behaviour.
