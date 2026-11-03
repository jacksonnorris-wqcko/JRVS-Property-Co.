# JRVS Property Co. — V0.1.5.2 UI & notification hotfix

Built on V0.1.5.1. This release reduces unnecessary vertical scrolling with a denser workspace layout, compact cards and controls, and a two-column Pricing & Quotes layout on desktop. On smaller screens the layout stacks responsively.

Native browser alert pop-ups have been replaced with in-app toast notifications. Native confirmation prompts have been replaced with a branded in-app confirmation dialog. PDF generation still opens a separate print window because the browser print dialog is required for Save as PDF.

Existing data keys are unchanged: `jrvs-data` in localStorage and `jrvs-photo-library` in IndexedDB. No data migration, clearing or photo deletion is performed.

Upload all six files from this ZIP to the existing GitHub Pages repository root, replacing matching files. Continue using the same browser profile and GitHub Pages URL.
