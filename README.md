# JRVS Property Co. V0.3.1.1 – List Limits Fix

Corrects V0.3.1 list behaviour. Jobs, clients, service packages, quotes and invoices show the five most recent/matching entries by default. Search reveals up to ten matching entries and displays a count with guidance to refine the search for older records. This avoids unbounded scrolling while keeping records discoverable. Dashboard recent jobs remain limited to five. Upcoming events remain limited to today through the next seven days.

## Install
Extract the ZIP and upload all files/folders into the existing GitHub repository root, replacing matching files. Do not upload the ZIP itself. No SQL changes are required.

## Data safety
This is a UI/list rendering change. It retains the existing localStorage keys, photo IndexedDB database/store, Supabase schema and cloud-sync code from V0.3.1. No records are deleted; items beyond the display limit remain stored and searchable.

## Validation
Static checks only; live browser and Supabase workflows have not been exercised in this build.


## V0.3.2 – Quote & Invoice Documents
- Quotes include a customer thank-you message and default to 30-day validity (editable on the quote form).
- Invoices include payment instructions, invoice-number payment reference, due-date guidance and clearly marked placeholders for bank account details.
- No existing customer, job, quote, invoice, photo, calendar or cloud data is reset or migrated.
- Existing five-item default list limits and seven-day upcoming-events window are retained.


## V0.3.3 – Desktop Workflow Refinement
- Added quick workflow-stage changes from the job detail view.
- Added direct job-detail shortcuts to edit job details, create a linked quote, and open the job photo gallery.
- Added linked invoice visibility, PDF access and mark-as-paid action from the job detail view.
- Preserves existing localStorage keys, IndexedDB photo library, Supabase configuration, cloud sync, brand palette, list caps and seven-day upcoming-events window.
- No SQL changes or data reset required.


## V0.3.3.1 Dashboard tidy-up
- Removed the duplicate Quick actions panel from the bottom of the dashboard.
- Added New client beside New job and New quote in the desktop header actions.
- Recent jobs now uses the available dashboard content width.
- No data migration, database or Supabase changes.


## V0.3.4 – Photo Search & Settings Refresh
- Added photo/project search by project name, client, address, photo filename and photo workflow status.
- Reworked Settings into clearer Cloud Sync, App Updates, Install JRVS, and Data & Privacy sections.
- Preserved existing Supabase configuration, localStorage records, IndexedDB photo library, brand palette, list caps and calendar rules.
- No SQL changes required.


## V0.3.5 – Cloud Sync & Settings Redesign
- Redesigned Cloud Sync as a control-centre card with a prominent synchronisation action.
- Moved email/password and account actions into a collapsible Account & sign-in section.
- Moved first-sync guidance into a collapsible help section.
- Kept existing Supabase authentication and sync implementation unchanged.
- No database migration, SQL changes, or data reset required.
- Device indicator identifies only the current device; it does not claim live remote-device presence.


## V0.3.5.1 – Install prompt improvement
- The Install JRVS button is always visible.
- Uses the native browser PWA install prompt when available.
- Provides tailored instructions for iPhone Safari, Android, and desktop Chrome/Edge when a native prompt is unavailable.
- Detects an already-installed standalone app and updates the button state.
- No changes to authentication, cloud sync, local records, or photo storage.
