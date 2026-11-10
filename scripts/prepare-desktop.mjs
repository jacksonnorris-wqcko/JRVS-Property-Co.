import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'desktop-dist');

function replaceExactlyOnce(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`Desktop preparation expected one occurrence of "${label}", found ${count}. Refusing to produce a partial desktop build.`);
  }
  return source.replace(before, after);
}

let html = await readFile(path.join(root, 'index.html'), 'utf8');

// The desktop shell has its own independently versioned release track.
html = replaceExactlyOnce(
  html,
  "const APP_VERSION='0.48.0';",
  "const APP_VERSION='0.52.0';",
  'desktop application version'
);

// The desktop edition is local-only. Keep the legacy PWA untouched on main,
// while removing cloud and browser-install wiring from this desktop snapshot.
html = replaceExactlyOnce(
  html,
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
  '',
  'Supabase browser SDK include'
);

const supabaseInit = /const JRVS_SUPABASE_URL='[^']*';\s*const JRVS_SUPABASE_PUBLISHABLE_KEY='[^']*';\s*let jrvsSupabase=null,\s*jrvsCloudSession=null,\s*jrvsCloudBusy=false;\s*try\s*\{\s*if\(window\.supabase\?\.createClient\) jrvsSupabase=window\.supabase\.createClient\(JRVS_SUPABASE_URL,JRVS_SUPABASE_PUBLISHABLE_KEY\);\s*\} catch\(e\)\{console\.error\('JRVS cloud client unavailable',e\)\}/;
if (!supabaseInit.test(html)) {
  throw new Error('Could not locate the expected legacy Supabase initialisation block. Desktop build stopped.');
}
html = html.replace(supabaseInit, 'let jrvsSupabase=null, jrvsCloudSession=null, jrvsCloudBusy=false;');

html = replaceExactlyOnce(
  html,
  'render();loadPhotos();renderQuotes();renderFinances();jrvsCloudInit();',
  'render();loadPhotos();renderQuotes();renderFinances();',
  'legacy cloud initialisation call'
);

html = replaceExactlyOnce(
  html,
  "if('serviceWorker'in navigator&&location.protocol!=='file:'){window.addEventListener('load',async()=>{try{await navigator.serviceWorker.register('./sw.js');}catch(e){}checkForUpdates()})}",
  '// Desktop builds are installed and updated by the Windows app, not a PWA service worker.',
  'PWA service-worker registration'
);
html = replaceExactlyOnce(
  html,
  "document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForUpdates()});",
  '// Desktop update checks are handled by the installed Windows app.',
  'PWA visibility-based update check'
);

html = replaceExactlyOnce(html, '<link rel="manifest" href="manifest.json">', '', 'PWA manifest link');
html = replaceExactlyOnce(
  html,
  '<button class="secondary" onclick="checkForUpdates(true)">Check now</button>',
  '<button class="secondary" type="button" onclick="jrvsCheckForUpdates(true)">Check now</button>',
  'native desktop update check action'
);
html = replaceExactlyOnce(html, '<section class="settings-card cloud-control-card">', '<section class="settings-card cloud-control-card desktop-cloud-card">', 'cloud settings card');
const desktopMigrationCard = `<section class="settings-card desktop-migration-card">
  <div class="settings-card-head"><span class="settings-icon">⇄</span><div><h3>Workspace data & backups</h3><p>Move your existing JRVS records onto this PC and protect the whole workspace.</p></div><span class="pill">Local storage</span></div>
  <div class="row-card"><div><strong>Create a full backup</strong><small>Includes jobs, clients, quotes, invoices, calendar events and the photo library.</small></div><button class="primary" type="button" onclick="jrvsCreateDesktopBackup()">Create backup</button></div>
  <div class="row-card"><div><strong>Import an existing JRVS export</strong><small>Choose a .jrvslegacy.gz export from your old browser app or a .jrvsbackup.gz desktop backup.</small></div><input id="jrvsDesktopImportFile" type="file" accept=".gz,.jrvslegacy,.jrvsbackup,application/gzip,application/json" onchange="jrvsImportWorkspaceFile(this)"></div>
  <div class="settings-note">Imports leave the original browser workspace untouched. A safety backup is downloaded before replacing the records on this PC. Photo originals are copied into the JRVS managed photo folder.</div>
  <div class="desktop-data-status" id="jrvsDesktopDataStatus">Checking the local JRVS workspace…</div>
</section>`;
html = replaceExactlyOnce(
  html,
  '<section class="settings-card"><div class="settings-card-head"><span class="settings-icon">↻</span><div><h3>App updates</h3>',
  desktopMigrationCard + '\n        <section class="settings-card desktop-update-card"><div class="settings-card-head"><span class="settings-icon">↻</span><div><h3>App updates</h3>',
  'browser update settings card'
);
html = replaceExactlyOnce(
  html,
  '<section class="settings-card"><div class="settings-card-head"><span class="settings-icon">▣</span><div><h3>Install JRVS</h3>',
  '<section class="settings-card desktop-install-card"><div class="settings-card-head"><span class="settings-icon">▣</span><div><h3>Install JRVS</h3>',
  'PWA install settings card'
);

html = replaceExactlyOnce(html, 'Manage your JRVS account, device setup and app updates.', 'Manage this PC\'s JRVS workspace and app preferences.', 'desktop settings description');
html = replaceExactlyOnce(html, 'Records are stored locally and can sync to your private JRVS cloud account.', 'Records are stored on this PC in your local JRVS workspace.', 'local storage description');
html = replaceExactlyOnce(html, '<span class="pill">Local + Cloud</span>', '<span class="pill">Local only</span>', 'local-only storage label');
html = replaceExactlyOnce(
  html,
  'Automatic app updates do not replace or delete saved records. Keep your cloud account credentials secure. Avoid clearing browser data, as this can remove local records and photos that have not been synchronised.',
  'Business records are saved in the JRVS SQLite workspace. Photo originals are also copied into the managed JRVS data folder. Create regular full backups and keep a second copy somewhere safe.',
  'desktop data privacy note'
);
html = replaceExactlyOnce(
  html,
  'Permanently removes jobs, clients, quotes, invoices, financial records, calendar entries and all stored photos. When signed in, your JRVS cloud workspace is cleared too. Your login, app and settings remain.',
  'Permanently removes local jobs, clients, quotes, invoices, financial records, calendar entries and all stored photos. Your Windows app installation remains.',
  'desktop reset warning'
);

// Mark the generated entry as desktop-only and suppress legacy browser controls.
const updaterKey = (await readFile(path.join(root, 'src-tauri', 'updater.pubkey'), 'utf8').catch(() => '')).trim();
const updaterConfigured = Boolean(updaterKey && updaterKey !== 'PUBLIC_KEY_PENDING_SETUP');
const desktopHeadInjection = `<style>
html.jrvs-desktop #page-settings .desktop-cloud-card,
html.jrvs-desktop #page-settings .desktop-install-card { display: none !important; }
</style>
<style id="jrvs-desktop-v052-ui">

html.jrvs-desktop{color-scheme:dark;--paper:#1b221c;--ink:#edf1e8;--muted:#a5b09e;--line:#3b4638;--surface:#141a15;--surface-soft:#222a21;--cream:#222b21}
html.jrvs-desktop body{background:#101511!important;color:#edf1e8!important}
html.jrvs-desktop .shell{grid-template-rows:minmax(0,1fr)!important;background:#101511!important}
html.jrvs-desktop .desktop-statusbar{display:none!important}
html.jrvs-desktop .shell>aside{background:linear-gradient(180deg,#273322,#1a2118)!important}
html.jrvs-desktop .shell>main{padding-bottom:26px!important}
html.jrvs-desktop .desktop-storage-card p{color:#c5ceb9!important}
html.jrvs-desktop .desktop-storage-card small{color:#b5c0a7!important}
html.jrvs-desktop .panel,html.jrvs-desktop .stat,html.jrvs-desktop .row-card,html.jrvs-desktop .project-card,html.jrvs-desktop .project-info,html.jrvs-desktop .settings-card,html.jrvs-desktop .settings-note,html.jrvs-desktop .quote-panel,html.jrvs-desktop .quote-stat,html.jrvs-desktop .quote-card,html.jrvs-desktop .package-card,html.jrvs-desktop .finance-stat,html.jrvs-desktop .finance-linked-card,html.jrvs-desktop .finance-panel,html.jrvs-desktop .calendar-panel,html.jrvs-desktop .client-contact-card,html.jrvs-desktop .client-profile-notes,html.jrvs-desktop .job-detail-stat,html.jrvs-desktop .job-detail-info div,html.jrvs-desktop .job-detail-notes,html.jrvs-desktop .attention-item,html.jrvs-desktop .recent-job-card,html.jrvs-desktop .batch-tools,html.jrvs-desktop .media-toolbar,html.jrvs-desktop .empty,html.jrvs-desktop .quote-empty{background:#1b221c!important;border-color:#394637!important;color:#edf1e8!important;box-shadow:0 8px 24px #0003!important}
html.jrvs-desktop .panel h2,html.jrvs-desktop .panel h3,html.jrvs-desktop .toolbar h2,html.jrvs-desktop .settings-header h2,html.jrvs-desktop .settings-card h3,html.jrvs-desktop .row-card strong,html.jrvs-desktop .project-info strong,html.jrvs-desktop .quote-card-ref,html.jrvs-desktop .package-name,html.jrvs-desktop .finance-stat-value,html.jrvs-desktop .finance-linked-card strong,html.jrvs-desktop .job-detail-info strong{color:#f1f4ec!important}
html.jrvs-desktop .muted,html.jrvs-desktop .row-card small,html.jrvs-desktop .settings-header p,html.jrvs-desktop .settings-card p,html.jrvs-desktop .package-description,html.jrvs-desktop .quote-card-client,html.jrvs-desktop .quote-stat-label,html.jrvs-desktop .quote-stat-note,html.jrvs-desktop .finance-meta,html.jrvs-desktop .job-detail-row small{color:#b1bba9!important}
html.jrvs-desktop input,html.jrvs-desktop select,html.jrvs-desktop textarea,html.jrvs-desktop .quote-list-tools input,html.jrvs-desktop .quote-list-tools select{color:#f0f3e9!important;background:#111813!important;border-color:#465341!important}
html.jrvs-desktop select option,html.jrvs-desktop select optgroup{background:#182019!important;color:#f0f3e9!important}
html.jrvs-desktop input::placeholder,html.jrvs-desktop textarea::placeholder{color:#879382!important}
html.jrvs-desktop .secondary,html.jrvs-desktop .tiny-btn{background:#293429!important;color:#e3eadb!important;border:1px solid #465342!important}
html.jrvs-desktop .secondary:hover,html.jrvs-desktop .tiny-btn:hover{background:#354331!important;border-color:#72865b!important}
html.jrvs-desktop .primary{background:#9eb36b!important;color:#141a0f!important;border-color:#aabe77!important}
html.jrvs-desktop .danger,html.jrvs-desktop .tiny-btn.danger{background:#472b27!important;color:#f2c9bd!important;border-color:#69433a!important}
html.jrvs-desktop .pricing-tabs{background:#171e18!important;border-color:#3a4637!important}
html.jrvs-desktop .pricing-tab{color:#e7ecdf!important}
html.jrvs-desktop .pricing-tab:hover{background:#283227!important}
html.jrvs-desktop .pricing-tab.active{background:#35432e!important;border-color:#60744e!important;color:#f0f3e8!important;box-shadow:inset 0 -2px 0 #a8bf70!important}
html.jrvs-desktop .pricing-tab small{background:#29352a!important;color:#dce8c2!important}
html.jrvs-desktop .pricing-tab.active small{background:#a8bf70!important;color:#172012!important}
html.jrvs-desktop #page-quotes .quote-panel-head,html.jrvs-desktop #page-quotes .quote-list-panel .quote-panel-head{background:#1b221c!important}
html.jrvs-desktop #page-quotes .package-grid{grid-template-columns:repeat(auto-fit,minmax(285px,1fr))!important;gap:12px!important}
html.jrvs-desktop #page-quotes .package-card{display:flex!important;flex-direction:column!important;gap:11px!important;min-width:0!important;min-height:0!important;padding:17px!important;border:1px solid #3b4938!important;border-radius:14px!important;background:linear-gradient(145deg,#202920,#191f1a)!important;color:#edf1e8!important}
html.jrvs-desktop #page-quotes .package-card:hover{border-color:#81975e!important;transform:translateY(-1px)}
html.jrvs-desktop .package-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:13px}
html.jrvs-desktop .package-card-title{min-width:0;display:grid;gap:7px}
html.jrvs-desktop .package-name{font-size:15px!important;line-height:1.3;font-weight:800!important}
html.jrvs-desktop .package-price{font-size:20px!important;font-weight:850!important;color:#d6e7a6!important;white-space:nowrap}
html.jrvs-desktop .package-description{font-size:12px!important;line-height:1.55!important;color:#b7c2b0!important}
html.jrvs-desktop .package-tag{width:max-content;max-width:100%;background:#30402b!important;color:#d8e8aa!important;border:1px solid #46583b!important;font-size:9px;font-weight:800;letter-spacing:.55px}
html.jrvs-desktop .package-inclusions{border-top:1px solid #3a4737;padding-top:9px;color:#dfe6d8}
html.jrvs-desktop .package-inclusions summary{cursor:pointer;color:#c7dc8f;font-size:11px;font-weight:800;list-style:none}
html.jrvs-desktop .package-inclusions summary::-webkit-details-marker{display:none}
html.jrvs-desktop .package-inclusions summary:after{content:'＋';float:right;color:#a9c36d;font-size:14px}
html.jrvs-desktop .package-inclusions[open] summary:after{content:'−'}
html.jrvs-desktop .package-inclusions ul{margin:9px 0 0;padding-left:18px;display:grid;gap:5px}
html.jrvs-desktop .package-inclusions li{color:#b9c4b2;font-size:11px;line-height:1.45}
html.jrvs-desktop .package-actions{margin-top:auto;padding-top:11px;border-top:1px solid #354134}
html.jrvs-desktop .quote-card{background:#1d251f!important;border-color:#3b483a!important}
html.jrvs-desktop .quote-meta-chip{background:#293329!important;color:#c1ccb7!important}
html.jrvs-desktop .quote-card-actions{border-color:#394536!important}
html.jrvs-desktop .quote-status-pill,html.jrvs-desktop .invoice-status-pill{background:#303a2d!important;color:#dce7c8!important}
html.jrvs-desktop .quote-status-pill.accepted,html.jrvs-desktop .invoice-status-pill.paid{background:#2d422d!important;color:#c9e4ad!important}
html.jrvs-desktop .quote-status-pill.sent{background:#28394a!important;color:#c6d9f1!important}
html.jrvs-desktop .quote-status-pill.declined,html.jrvs-desktop .invoice-status-pill.overdue{background:#482d29!important;color:#f0c6b8!important}
html.jrvs-desktop .quote-empty{background:#1d251f!important;border-color:#465442!important}
html.jrvs-desktop .quote-empty strong{color:#edf1e8!important}
html.jrvs-desktop #quoteNewClientPanel{background:#20291f!important;border-color:#465440!important;color:#edf1e8!important}
html.jrvs-desktop #quoteNewClientPanel .quote-inline-heading{color:#d7e5b7!important}
html.jrvs-desktop #quoteNewClientPanel .field label{color:#c6d0bb!important}
html.jrvs-desktop #quoteLines .quote-line{grid-template-columns:minmax(190px,1.7fr) 76px minmax(110px,130px) 34px!important;border-color:#3c4938!important}
html.jrvs-desktop #quoteLines .line-package,html.jrvs-desktop #quoteLines .line-qty,html.jrvs-desktop #quoteLines .line-price{min-width:0!important;background:#111813!important;color:#f1f3ea!important;border-color:#465341!important}
html.jrvs-desktop #quoteTotals{background:#20291f!important;color:#eff3e8!important;border:1px solid #465441!important}
html.jrvs-desktop #quoteTotals .quote-total-row{color:#dfe7d7!important;border-color:#465341!important}
html.jrvs-desktop #quoteTotals .quote-total-row strong{color:#f2f5ed!important}
html.jrvs-desktop .app-toast{background:#202920!important;color:#eff3e8!important;border-color:#465440!important}
html.jrvs-desktop .app-toast-message{color:#eff3e8!important}
html.jrvs-desktop .app-toast-icon{background:#35452d!important;color:#dceba7!important}
html.jrvs-desktop .app-confirm{background:#1c241d!important;color:#eff3e8!important;border-color:#465341!important}
html.jrvs-desktop .app-confirm-copy h2{color:#f3f5ed!important}
html.jrvs-desktop .app-confirm-copy p{color:#b5c0b0!important}
html.jrvs-desktop .app-confirm-icon{background:#35452d!important;color:#dceba7!important}
html.jrvs-desktop .editor-panel,html.jrvs-desktop .editor-panel details,html.jrvs-desktop .editor-history{background:#1d251f!important;color:#edf1e8!important;border-color:#3b4839!important}
html.jrvs-desktop .editor-panel-heading,html.jrvs-desktop .editor-panel .editor-control label,html.jrvs-desktop .editor-panel details summary{color:#e7ecdf!important}
html.jrvs-desktop .photo-card,html.jrvs-desktop .photo-info{background:#1b221c!important;border-color:#394637!important;color:#edf1e8!important}
html.jrvs-desktop .photo-meta,html.jrvs-desktop .photo-info small{color:#acb8a5!important}
html.jrvs-desktop .job-workflow-actions,html.jrvs-desktop .batch-studio{background:#1d251e!important;border:1px solid #3d4937!important;color:#e8eee0!important}
html.jrvs-desktop .job-workflow-actions label,html.jrvs-desktop .batch-studio label{color:#c5d0b8!important}
html.jrvs-desktop .photo-select-wrap{background:#273324!important;color:#e9efdc!important;border-color:#80945f!important}
html.jrvs-desktop .photo-preview-action{background:#202b22e8!important;color:#e8f0d9!important;border-color:#718656!important}
html.jrvs-desktop .photo-cover-badge{background:#35432e!important;color:#e2ecbf!important;border-color:#718656!important}
html.jrvs-desktop .calendar-grid .cal-weekday{background:#202920!important;color:#bfcaaa!important}
html.jrvs-desktop .calendar-grid .cal-cell{background:#171e18!important;color:#dfe5d7!important;border-color:#394637!important}
html.jrvs-desktop .quote-stat-icon{background:#30402b!important;color:#d8e8aa!important}
html.jrvs-desktop .finance-status,html.jrvs-desktop .job-status-pill{background:#30402b!important;color:#d8e8aa!important}
html.jrvs-desktop .quote-total{background:#20291f!important;color:#eff3e8!important;border:1px solid #465441!important}
html.jrvs-desktop .editor-panel,html.jrvs-desktop .editor-panel details,html.jrvs-desktop .editor-history{background:#1d251f!important;color:#edf1e8!important;border-color:#3b4839!important}
@media(max-width:1100px){html.jrvs-desktop #page-quotes .package-grid{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))!important}}
@media(max-width:650px){html.jrvs-desktop #page-quotes .package-grid{grid-template-columns:1fr!important}html.jrvs-desktop #quoteLines .quote-line{grid-template-columns:minmax(0,1fr) 62px 90px 30px!important}}

</style>
<script>
window.__JRVS_DESKTOP__ = true;
window.__JRVS_DESKTOP_UPDATER_CONFIGURED__ = ${updaterConfigured};
document.documentElement.classList.add('jrvs-desktop');
</script>
`;
const headCloseIndex = html.indexOf('</head>');
if (headCloseIndex < 0) {
  throw new Error('Could not find the document head. Desktop build stopped.');
}
html = html.slice(0, headCloseIndex) + desktopHeadInjection + html.slice(headCloseIndex);
html = replaceExactlyOnce(
  html,
  'Business data remains in this app profile · Native backup and managed photo storage are not enabled yet',
  'SQLite workspace active · Managed photo copies enabled · Use Settings for backup and migration',
  'desktop storage status footer'
);
html = replaceExactlyOnce(
 html,
 '<strong>This PC</strong><p>Records currently stay in this app profile.</p><small>Managed photo folders and native backups are still being built.</small>',
 '<strong>This PC</strong><p>Business records are stored locally on this PC.</p><small>Managed photo copies and portable backups are available in Settings.</small>',
 'desktop workspace sidebar status'
);
const desktopStatusStart = html.indexOf('<footer class="desktop-statusbar">');
const desktopStatusEnd = html.indexOf('</footer>', desktopStatusStart);
if (desktopStatusStart < 0 || desktopStatusEnd < 0) {
 throw new Error('Could not locate the desktop status strip for removal.');
}
html = html.slice(0, desktopStatusStart) + html.slice(desktopStatusEnd + '</footer>'.length);

// Add local database migration, photo import, and portable backup tools.
const desktopDataToolsInjection = "\n<script id=\"jrvs-desktop-data-tools\">\n(function(){\n const invoke=window.__TAURI__?.core?.invoke;\n const status=()=>document.getElementById('jrvsDesktopDataStatus');\n function setStatus(message,error=false){const el=status();if(el){el.textContent=message;el.classList.toggle('error',!!error)}}\n function b64ToBlob(value,type){\n  const binary=atob(value||'');const bytes=new Uint8Array(binary.length);\n  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);\n  return new Blob([bytes],{type:type||'application/octet-stream'});\n }\n async function sha256Hex(blob){\n  if(!window.crypto?.subtle)throw new Error('Secure SHA-256 checks are unavailable in this Windows WebView. Update WebView2 before creating or importing a backup.');\n  const digest=await window.crypto.subtle.digest('SHA-256',await blob.arrayBuffer());\n  return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');\n }\n async function sha256Text(value){return sha256Hex(new Blob([value],{type:'application/json'}))}\n function dateStamp(){return new Date().toISOString().slice(0,10)}\n async function downloadPayload(payload,name){\n  const json=JSON.stringify(payload);\n  if(!('CompressionStream' in window))throw new Error('This Windows WebView does not support compressed backups.');\n  const blob=await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).blob();\n  const url=URL.createObjectURL(blob),a=document.createElement('a');\n  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();\n  setTimeout(()=>URL.revokeObjectURL(url),60000);\n  return blob.size;\n }\n async function readPayload(file){\n  const bytes=await file.arrayBuffer();\n  const view=new Uint8Array(bytes);\n  if(view[0]===0x1f&&view[1]===0x8b){\n   if(!('DecompressionStream' in window))throw new Error('Compressed import files require a current version of Windows WebView2.');\n   return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());\n  }\n  return JSON.parse(new TextDecoder().decode(bytes));\n }\n async function createBackupPayload(){\n  const business=JSON.parse(localStorage.getItem('jrvs-data')||'{}');\n  const calendar=JSON.parse(localStorage.getItem('jrvs-calendar')||'[]');\n  const records=await photoRequest('readonly','all');\n  const photos=[];\n  for(let i=0;i<records.length;i++){\n   const photo=records[i];if(!photo?.blob)throw new Error('Photo '+(photo?.name||photo?.id||i+1)+' has no original file. Backup stopped.');\n   const metadata={...photo};delete metadata.blob;delete metadata.previewBlob;\n   for(const key of ['url','previewUrl','objectUrl','previewObjectUrl'])delete metadata[key];\n   const originalSha256=await sha256Hex(photo.blob);\n   const previewSha256=photo.previewBlob?await sha256Hex(photo.previewBlob):null;\n   photos.push({...metadata,blobMimeType:photo.blob.type||photo.mimeType||'application/octet-stream',previewMimeType:photo.previewBlob?.type||null,originalByteLength:photo.blob.size,previewByteLength:photo.previewBlob?.size||0,originalSha256,previewSha256,blobBase64:await jrvsPhotoBase64(photo.blob),previewBase64:photo.previewBlob?await jrvsPhotoBase64(photo.previewBlob):null});\n   if((i+1)%10===0)setStatus('Preparing full backup · '+(i+1)+' of '+records.length+' photos…');\n  }\n  const manifest={hashAlgorithm:'SHA-256',photoCount:photos.length,businessSha256:await sha256Text(JSON.stringify(business)),calendarSha256:await sha256Text(JSON.stringify(calendar)),originalPhotoBytes:photos.reduce((sum,photo)=>sum+(photo.originalByteLength||0),0),previewPhotoBytes:photos.reduce((sum,photo)=>sum+(photo.previewByteLength||0),0)};\n  return {format:'jrvs-portable-workspace',formatVersion:2,appVersion:'0.52.0',exportedAt:new Date().toISOString(),business,calendar,photos,hasPhotoLibrary:true,manifest};\n }\n window.jrvsCreateDesktopBackup=async function(){\n  const button=document.querySelector('.desktop-migration-card button[onclick=\"jrvsCreateDesktopBackup()\"]');\n  if(button){button.disabled=true;button.textContent='Creating…'}\n  try{\n   setStatus('Preparing the database and photo library for backup…');\n   const payload=await createBackupPayload();\n   const size=await downloadPayload(payload,'JRVS-Backup-'+dateStamp()+'.jrvsbackup.gz');\n   setStatus('Backup created · '+(payload.business.jobs?.length||0)+' jobs · '+(payload.business.clients?.length||0)+' clients · '+payload.photos.length+' photos · '+(size/1048576).toFixed(1)+' MB');\n   if(typeof showToast==='function')showToast('Your complete JRVS backup has been created.');\n  }catch(error){console.error(error);setStatus('Backup failed: '+(error?.message||error),true);if(typeof showToast==='function')showToast('JRVS backup failed. '+(error?.message||error),'error')}\n  finally{if(button){button.disabled=false;button.textContent='Create backup'}}\n };\n window.jrvsImportWorkspaceFile=async function(input){\n  const file=input?.files?.[0];if(!file)return;\n  input.disabled=true;\n  try{\n   setStatus('Reading and validating the selected workspace file…');\n   const payload=await readPayload(file);\n   if(!['jrvs-legacy-workspace','jrvs-portable-workspace'].includes(payload?.format)||![1,2].includes(payload.formatVersion))throw new Error('This is not a supported JRVS migration or backup file.');\n   if(!payload.business||typeof payload.business!=='object'||Array.isArray(payload.business))throw new Error('The file does not contain a valid JRVS business workspace.');\n   if(!Array.isArray(payload.calendar))throw new Error('The file does not contain a valid JRVS calendar.');\n   if(!Array.isArray(payload.photos))throw new Error('The file does not contain a photo-library list.');\n   const seenPhotoIds=new Set();\n   if(payload.formatVersion===2){\n    const manifest=payload.manifest;\n    if(!manifest||manifest.hashAlgorithm!=='SHA-256'||manifest.photoCount!==payload.photos.length)throw new Error('The backup integrity manifest is missing or inconsistent.');\n    if(await sha256Text(JSON.stringify(payload.business))!==manifest.businessSha256)throw new Error('Business records failed their SHA-256 integrity check. No data has been imported.');\n    if(await sha256Text(JSON.stringify(payload.calendar))!==manifest.calendarSha256)throw new Error('Calendar events failed their SHA-256 integrity check. No data has been imported.');\n   }\n   let actualOriginalBytes=0,actualPreviewBytes=0;\n   for(let i=0;i<payload.photos.length;i++){\n    const photo=payload.photos[i];\n    if(!photo||photo.id==null||!photo.blobBase64)throw new Error('Photo '+(i+1)+' is incomplete. Import stopped without replacing the current workspace.');\n    const photoId=String(photo.id);\n    if(seenPhotoIds.has(photoId))throw new Error('The backup contains a duplicate photo ID ('+photoId+'). No data has been imported.');\n    seenPhotoIds.add(photoId);\n    if(payload.formatVersion===2){\n     const original=b64ToBlob(photo.blobBase64,photo.blobMimeType||photo.mimeType||'application/octet-stream');\n     actualOriginalBytes+=original.size;\n     if(original.size!==photo.originalByteLength||await sha256Hex(original)!==photo.originalSha256)throw new Error('Photo '+(photo.name||photoId)+' failed its original-file integrity check. No data has been imported.');\n     if(photo.previewBase64){\n      const preview=b64ToBlob(photo.previewBase64,photo.previewMimeType||'image/jpeg');\n      actualPreviewBytes+=preview.size;\n      if(preview.size!==photo.previewByteLength||await sha256Hex(preview)!==photo.previewSha256)throw new Error('Photo '+(photo.name||photoId)+' failed its preview integrity check. No data has been imported.');\n     }else if(photo.previewSha256||photo.previewByteLength)throw new Error('Photo '+(photo.name||photoId)+' has inconsistent preview metadata.');\n    }\n   }\n   if(payload.formatVersion===2&&(actualOriginalBytes!==payload.manifest.originalPhotoBytes||actualPreviewBytes!==payload.manifest.previewPhotoBytes))throw new Error('Photo-library byte totals do not match the integrity manifest. No data has been imported.');\n   const summary=[\n    (payload.business.jobs||[]).length+' jobs',(payload.business.clients||[]).length+' clients',\n    (payload.business.quotes||[]).length+' quotes',(payload.business.invoices||[]).length+' invoices',\n    payload.calendar.length+' calendar events',payload.photos.length+' photos'\n   ].join(' · ');\n   const ok=await showConfirm('Import '+summary+'? Your current desktop records will be replaced. JRVS will download a full safety backup first. The original browser data is not changed.',{title:'Import JRVS workspace',confirmText:'Back up and import',danger:false});\n   if(!ok){input.value='';return}\n   setStatus('Creating a safety backup of the current desktop workspace…');\n   const before=await createBackupPayload();\n   await downloadPayload(before,'JRVS-Before-Import-'+dateStamp()+'.jrvsbackup.gz');\n   setStatus('Copying photo originals into the managed JRVS library…');\n   const importedIds=new Set();\n   for(let i=0;i<payload.photos.length;i++){\n    const source=payload.photos[i],photo={...source};\n    photo.blob=b64ToBlob(source.blobBase64,source.blobMimeType||source.mimeType||'application/octet-stream');\n    photo.previewBlob=source.previewBase64?b64ToBlob(source.previewBase64,source.previewMimeType||'image/jpeg'):null;\n    delete photo.blobBase64;delete photo.previewBase64;importedIds.add(String(photo.id));\n    setStatus('Copying photo originals into the managed JRVS library · '+(i+1)+' of '+payload.photos.length+'…');\n    await photoRequest('readwrite','put',photo);\n   }\n   if(window.__JRVS_MANAGED_PHOTO_FLUSH__)await window.__JRVS_MANAGED_PHOTO_FLUSH__();\n   setStatus('Committing business records into the local SQLite workspace…');\n   await invoke('desktop_import_legacy_workspace',{businessJson:JSON.stringify(payload.business),calendarJson:JSON.stringify(payload.calendar)});\n   if(payload.hasPhotoLibrary){\n    const existing=await photoRequest('readonly','all');\n    for(const photo of existing||[])if(!importedIds.has(String(photo.id)))await photoRequest('readwrite','delete',photo.id);\n   }\n   if(window.__JRVS_MANAGED_PHOTO_FLUSH__)await window.__JRVS_MANAGED_PHOTO_FLUSH__();\n   const storage=window.__JRVS_NATIVE_STORAGE__;\n   if(storage){storage.replace({'jrvs-data':JSON.stringify(payload.business),'jrvs-calendar':JSON.stringify(payload.calendar)});await storage.flush()}\n   await refreshNativeStatus();\n   setStatus('Import complete · '+summary+'. Local database and managed photo copies are ready.');\n   if(typeof showToast==='function')showToast('JRVS workspace imported successfully. Reloading…');\n   input.value='';\n   setTimeout(()=>location.reload(),900);\n  }catch(error){\n   console.error('JRVS workspace import failed',error);\n   setStatus('Import stopped: '+(error?.message||error)+'. Check the safety backup in Downloads before retrying.',true);\n   if(typeof showToast==='function')showToast('JRVS import stopped. '+(error?.message||error),'error');\n   input.value='';\n  }finally{input.disabled=false;refreshNativeStatus()}\n };\n async function refreshNativeStatus(){\n  if(!invoke)return;\n  try{\n   const info=await invoke('desktop_storage_status');\n   const size=(Number(info.managedPhotoBytes)||0)/1048576;\n   if(window.__JRVS_MANAGED_PHOTO_ERROR__)throw new Error('Managed photo storage needs attention: '+window.__JRVS_MANAGED_PHOTO_ERROR__);\n   const el=status();\n   if(el&&!el.textContent.startsWith('Import')&&!el.textContent.startsWith('Backup'))el.textContent='SQLite workspace · '+info.storageKeys+' saved keys · '+info.managedPhotoCount+' managed photos · '+size.toFixed(1)+' MB managed photo storage';\n  }catch(error){setStatus('Local workspace status unavailable: '+(error?.message||error),true)}\n }\n window.jrvsRefreshNativeStatus=refreshNativeStatus;\n setTimeout(refreshNativeStatus,0);\n})();\n</script>";
const desktopBodyClose = html.lastIndexOf('</body>');
if (desktopBodyClose < 0) {
  throw new Error('Could not find the body closing tag in the desktop frontend.');
}
html = html.slice(0, desktopBodyClose) + desktopDataToolsInjection + html.slice(desktopBodyClose);

// The native signed updater remains active in desktop builds. Only browser
// service-worker refresh logic is removed from the generated desktop frontend.
const refreshBlock = /async function refreshApp\(\)\s*\{[\s\S]*?\}\s*async function waitForWorkerActivation/;
if (!refreshBlock.test(html)) {
  throw new Error('Could not locate the existing app refresh function. Desktop build stopped.');
}
html = html.replace(
  refreshBlock,
  `function refreshApp(){
 showToast('Reloading the JRVS desktop workspace…','info',1800);
 setTimeout(()=>location.reload(),250);
}
async function waitForWorkerActivation`
);

// Fail closed if the generated desktop entry accidentally retains cloud bootstrap.
for (const forbidden of ['@supabase/supabase-js', 'JRVS_SUPABASE_URL=', 'sb_publishable_', 'jrvsCloudInit();', "navigator.serviceWorker.register('./sw.js')", 'visibilitychange', 'checkForUpdates()});']) {
  if (html.includes(forbidden)) throw new Error(`Desktop output still contains forbidden browser/cloud wiring: ${forbidden}`);
}

// Parse every inline script without executing it. This catches syntax errors in
// the generated Windows frontend before Tauri starts bundling.
const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (inlineScripts.length < 2) {
  throw new Error('Expected the desktop marker and main app scripts in the generated frontend.');
}
for (let index = 0; index < inlineScripts.length; index += 1) {
  try {
    new Function(inlineScripts[index][1]);
  } catch (error) {
    throw new Error(`Generated desktop inline script ${index + 1} has a syntax error: ${error.message}`);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(path.join(root, 'jrvs-logo.png'), path.join(output, 'jrvs-logo.png'));
await writeFile(path.join(output, 'index.html'), html, 'utf8');

console.log('Prepared local-only JRVS desktop frontend in desktop-dist/.');
