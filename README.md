JRVS Property Co. — V0.1.9.3 Finance page visibility hotfix

Fix:
- Finance was appearing underneath Pricing & Quoting because the #page-finances CSS rule set display:flex with higher specificity than the shared hidden-page rule.
- Finance now defaults to display:none and only displays as a flex column when it has the active class.
- Pricing & Quoting contains only its sales workspace; Finance remains a separate navigation page.

No business data, localStorage keys, calendar storage, photo IndexedDB, or invoice/payment logic changed.

Install:
1. Extract the ZIP.
2. Upload all files and folders into the root of the existing GitHub repository, replacing the previous release files.
3. Keep using the same browser profile and existing app URL. Do not clear site data or uninstall the app.

This is a CSS visibility fix; it has not been live-tested in the user's browser.
