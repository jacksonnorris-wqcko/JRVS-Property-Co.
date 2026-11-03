# JRVS Property Co. — V0.1.0 Baseline Beta

This is the new baseline release for JRVS Property Co.

## What's new
- Accepted quotations without an existing job now offer a Create job action.
- Creating a job from an accepted quote carries across the client, quote reference, services and quoted total, then links the quote to the new job.
- Newly created jobs start in Booked status and can be edited to add the property address and scheduled date.
- Job status options now include Enquiry, Quoted, Booked, Photography, Editing and Delivered.
- Dashboard includes a Needs attention panel for sent quotations and unpaid income, with shortcuts to the relevant section/job.

## Existing foundations retained
- Jobs and clients
- Photo library and IndexedDB image storage
- Pricing packages and optional extras
- Quotations and GST calculations
- Income and expense tracking
- Job and client profile views
- Automatic update checks with refresh-loop protection

## Install
Upload all files in this ZIP to the root of the existing GitHub Pages repository, replacing the previous files. Keep the same browser profile/device so locally stored records and photos remain available.

## Important
Data remains browser-local (localStorage for records, IndexedDB for photos). Cloud sync, PDF quotes/invoices, email delivery and bank feeds are not included in this baseline.
