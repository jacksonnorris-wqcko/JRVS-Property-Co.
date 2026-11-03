# JRVS Property Co. V0.1.6.1 — Desktop App Install Update

This update makes the GitHub Pages site installable as a standalone Progressive Web App (PWA).

Included:
- PWA manifest with standalone display mode, scope, app identity, launch URL and shortcuts.
- Branded 192px and 512px square application icons.
- Settings install control when Chrome/Edge exposes the install prompt.
- Clear desktop installation instructions in Settings.
- Updated service-worker cache version and precached app icons.

How to install on Windows:
1. Upload all ZIP contents to the root of the existing JRVS GitHub repository, replacing matching files.
2. Open the existing GitHub Pages URL in Chrome or Edge.
3. Go to Settings inside JRVS. If an Install app button appears, click it and accept.
4. If no button appears, use the browser's install icon at the right side of the address bar, or browser menu → Cast, save and share / Apps → Install this site as an app (wording varies).
5. After installation, launch JRVS from the Windows Start menu. Right-click its Start menu entry to pin it to the taskbar or create a desktop shortcut where supported.

Important:
- Must be served over HTTPS (GitHub Pages qualifies).
- Installing creates an app-like window; it does not move the app data to cloud storage.
- Existing jobs, clients, quotes, invoices and photos remain in the same browser profile/site storage. Do not clear browser site data or switch browser profiles during installation.
- Desktop installability depends on the browser and its PWA criteria. No live browser install test was performed.
