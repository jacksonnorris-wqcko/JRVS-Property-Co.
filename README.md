JRVS Property Co. — V0.1.9.2

Release: Pricing & Quotes / Finance separation

What changed
- Pricing & Quotes is now explicitly the sales workspace: packages, quotations and invoices.
- Its summary cards remain focused on service packages, quotes created, accepted quotes and total quoted value. These are sales metrics, not accounting figures.
- Finance is the single home for payments received, outstanding invoice balances, expenses, net cash position and transaction management.
- Removed the duplicated business-activity summary from Finance so the dashboard is cleaner and avoids repeating the same received/outstanding figures.
- Invoices continue to feed Finance automatically.

Data safety
- Existing localStorage key jrvs-data is unchanged.
- Existing calendar key jrvs-calendar is unchanged.
- Existing photo database jrvs-photo-library and photos object store are unchanged.
- No data reset or destructive migration is performed.

Deployment
Extract the ZIP and upload all files/folders into the root of the existing GitHub Pages repository, replacing matching files. Do not upload the ZIP itself or place its contents inside a nested folder. Keep using the same browser/profile and do not clear site data.

Testing note
Static release checks only; live browser testing against the hosted site has not been performed.
