import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

const desktopPackage = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const desktopVersion = String(desktopPackage.version || '').trim();
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(desktopVersion)) {
  throw new Error('package.json must contain a valid desktop semantic version. Desktop build stopped.');
}

let html = await readFile(path.join(root, 'index.html'), 'utf8');

// The desktop shell has its own independently versioned release track.
// Read its version from package.json so the visible in-app version cannot drift
// away from the version checked by the signed-release workflow.
html = replaceExactlyOnce(
  html,
  "const APP_VERSION='0.48.0';",
  `const APP_VERSION='${desktopVersion}';`,
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
<style id="jrvs-desktop-v052-reference-layout">

/* V0.52 design reference pass — desktop only */
html.jrvs-desktop{
 --jrvs-bg:#0b0d0b;
 --jrvs-sidebar:#222b1c;
 --jrvs-sidebar-deep:#1b2418;
 --jrvs-panel:#191d19;
 --jrvs-panel-raised:#20251f;
 --jrvs-panel-soft:#262c25;
 --jrvs-border:#373e33;
 --jrvs-text:#f5f2e7;
 --jrvs-muted:#a6ad9b;
 --jrvs-lime:#c0d965;
 --jrvs-lime-strong:#aec94e;
 --jrvs-sage:#899b68;
 color-scheme:dark;
}
html.jrvs-desktop body{background:var(--jrvs-bg)!important;color:var(--jrvs-text)!important;font-family:Inter,"Segoe UI",system-ui,sans-serif!important;font-size:13px!important;letter-spacing:0!important}
html.jrvs-desktop .shell{height:100vh!important;min-height:0!important;grid-template-columns:252px minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;background:var(--jrvs-bg)!important;overflow:hidden!important}
html.jrvs-desktop .shell>aside{grid-column:1!important;grid-row:1!important;height:100vh!important;min-height:0!important;padding:24px 15px 16px!important;gap:22px!important;background:linear-gradient(180deg,#293421 0%,#20291b 58%,#1b2418 100%)!important;border-right:1px solid #394431!important;overflow-y:auto!important}
html.jrvs-desktop .shell>main{grid-column:2!important;grid-row:1!important;min-width:0!important;min-height:0!important;padding:22px 22px 28px!important;max-width:none!important;margin:0!important;overflow-y:auto!important;position:relative!important;background:var(--jrvs-bg)!important}
html.jrvs-desktop .desktop-statusbar{display:none!important}
html.jrvs-desktop .brand{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;padding:4px 4px 20px!important;margin:0 0 2px!important;border-bottom:1px solid #ffffff20!important}
html.jrvs-desktop .brand img{display:block!important;width:174px!important;height:104px!important;max-width:100%!important;object-fit:contain!important;object-position:center!important;border-radius:0!important;background:transparent!important}
html.jrvs-desktop .brand>div{display:grid!important;justify-items:center!important;gap:1px!important}
html.jrvs-desktop .brand-mark{font-size:23px!important;line-height:1!important;letter-spacing:2px!important;color:#f6f3e7!important}
html.jrvs-desktop .brand small{font-size:9px!important;letter-spacing:2.7px!important;font-weight:850!important;color:#d4ddc2!important}
html.jrvs-desktop .nav-label{padding:0 10px!important;margin:0 0 9px!important;color:#aab895!important;font-size:9px!important;font-weight:850!important;letter-spacing:2px!important}
html.jrvs-desktop .shell>aside nav{display:grid!important;gap:7px!important}
html.jrvs-desktop .shell>aside .nav-btn{width:100%!important;min-height:47px!important;padding:0 13px!important;display:flex!important;align-items:center!important;gap:13px!important;border:1px solid transparent!important;border-radius:11px!important;background:transparent!important;color:#e5e8d9!important;font-size:13px!important;font-weight:650!important;letter-spacing:0!important;box-shadow:none!important;transform:none!important}
html.jrvs-desktop .shell>aside .nav-btn span:first-child{width:22px!important;min-width:22px!important;text-align:center!important;font-size:18px!important;color:#d1d9bd!important;opacity:1!important}
html.jrvs-desktop .shell>aside .nav-btn:hover{background:#ffffff12!important;border-color:#ffffff14!important;color:#fff!important}
html.jrvs-desktop .shell>aside .nav-btn.active,
html.jrvs-desktop .shell>aside .nav-btn.active:hover{background:linear-gradient(105deg,#9fb64d 0%,#c2d85e 100%)!important;border-color:#d2e77d!important;color:#182012!important;box-shadow:0 4px 13px #0005,inset 0 1px #ffffff55!important;font-weight:800!important}
html.jrvs-desktop .shell>aside .nav-btn.active span:first-child{color:#192113!important}
html.jrvs-desktop .desktop-storage-card{margin-top:auto!important;padding:14px 13px!important;border:1px solid #718153!important;border-radius:14px!important;background:linear-gradient(145deg,#303a27,#222b1d)!important;color:#e8edda!important;box-shadow:0 8px 22px #0003!important}
html.jrvs-desktop .desktop-storage-icon{width:36px!important;height:36px!important;margin-bottom:10px!important;border-radius:10px!important;background:#a8bf5e!important;color:#172012!important}
html.jrvs-desktop .desktop-storage-card .desktop-kicker{color:#c0d18e!important}
html.jrvs-desktop .desktop-storage-card strong{color:#f3f1e5!important;font-size:14px!important}
html.jrvs-desktop .desktop-storage-card p{color:#c6ceb8!important}
html.jrvs-desktop .desktop-storage-card small{color:#b1bca3!important}
html.jrvs-desktop .desktop-storage-card #sideVersion{color:#c2d48c!important;font-size:9px!important}
html.jrvs-desktop .top{display:flex!important;align-items:center!important;gap:18px!important;min-height:62px!important;margin:0 0 18px!important;padding:0 0 14px!important;border-bottom:1px solid #333a30!important}
html.jrvs-desktop .top>div:first-child{min-width:220px}
html.jrvs-desktop .top .eyebrow{color:#b5ca77!important;font-size:9px!important;font-weight:850!important;letter-spacing:1.8px!important}
html.jrvs-desktop .top h1{color:#f5f2e7!important;font-size:26px!important;line-height:1.15!important;letter-spacing:-.7px!important;font-weight:780!important;margin:3px 0!important}
html.jrvs-desktop .top .sub{color:#a9b09f!important;font-size:12px!important;margin:0!important}
html.jrvs-desktop .top-tools{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:9px!important;min-width:0!important;flex:1!important}
html.jrvs-desktop .global-search{width:min(390px,34vw)!important;min-width:230px!important;height:43px!important;padding:0 13px!important;gap:9px!important;background:#1e231e!important;border:1px solid #394136!important;border-radius:12px!important;box-shadow:0 3px 12px #0002!important}
html.jrvs-desktop .global-search:focus-within{border-color:#8b9e60!important;box-shadow:0 0 0 3px #9eb85b20!important}
html.jrvs-desktop .global-search .search-icon{color:#b8c68a!important;font-size:18px!important}
html.jrvs-desktop .global-search input{min-height:39px!important;background:transparent!important;border:0!important;color:#f1f2e9!important;font-size:12px!important}
html.jrvs-desktop .header-actions{display:flex!important;gap:7px!important}
html.jrvs-desktop .header-action{height:40px!important;min-height:40px!important;padding:0 12px!important;border-radius:10px!important;font-size:11px!important;font-weight:750!important}
html.jrvs-desktop .header-action.secondary{background:#252c25!important;color:#eef0e4!important;border:1px solid #414a3d!important}
html.jrvs-desktop .header-action.primary{background:#a9c45b!important;color:#182012!important;border:1px solid #bedb6b!important}
html.jrvs-desktop .version.desktop-version-action{height:40px!important;padding:0 12px!important;border-radius:11px!important;background:#22291e!important;border:1px solid #4b5838!important;color:#c7d995!important;font-size:10px!important;font-weight:800!important}
html.jrvs-desktop .version.desktop-version-action:hover{background:#303b26!important;border-color:#98ad5d!important;color:#eff5d9!important}
html.jrvs-desktop body.jrvs-dashboard-active .top{height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:visible!important}
html.jrvs-desktop body.jrvs-dashboard-active .top>div:first-child{display:none!important}
html.jrvs-desktop body.jrvs-dashboard-active .top-tools{position:absolute!important;top:12px!important;right:22px!important;z-index:70!important}
html.jrvs-desktop body.jrvs-dashboard-active .header-actions{display:none!important}
html.jrvs-desktop body.jrvs-dashboard-active .desktop-dashboard-heading{min-height:76px!important;margin:0 0 13px!important;padding:3px 0 0!important;display:flex!important;align-items:center!important}
html.jrvs-desktop .desktop-dashboard-heading h2{margin:3px 0 5px!important;color:#f7f4e9!important;font-size:28px!important;line-height:1.12!important;letter-spacing:-.9px!important;font-weight:790!important}
html.jrvs-desktop .desktop-dashboard-heading p{margin:0!important;color:#abb29f!important;font-size:12px!important}
html.jrvs-desktop .desktop-kicker{color:#b7cc79!important;font-size:8px!important;font-weight:900!important;letter-spacing:1.8px!important}
html.jrvs-desktop .desktop-date-chip{display:none!important}
html.jrvs-desktop .desktop-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important;margin:0 0 18px!important}
html.jrvs-desktop .desktop-kpi{min-height:91px!important;display:flex!important;align-items:center!important;gap:14px!important;padding:14px 15px!important;border:1px solid #394136!important;border-radius:14px!important;background:linear-gradient(145deg,#20251f,#191d19)!important;box-shadow:0 7px 20px #0003!important}
html.jrvs-desktop .desktop-kpi-icon{width:54px!important;height:54px!important;flex:0 0 54px!important;display:grid!important;place-items:center!important;border-radius:14px!important;background:#3b482d!important;color:#d8ee70!important;font-size:24px!important}
html.jrvs-desktop .desktop-kpi span{display:block!important;color:#b4bca8!important;font-size:9px!important;font-weight:850!important;letter-spacing:1.25px!important}
html.jrvs-desktop .desktop-kpi strong{display:block!important;margin:4px 0 1px!important;color:#f5f2e8!important;font-size:27px!important;line-height:1!important;font-weight:820!important;letter-spacing:-.7px!important}
html.jrvs-desktop .desktop-kpi small{color:#9ba591!important;font-size:9px!important}
html.jrvs-desktop #page-dashboard .desktop-dashboard-layout{display:grid!important;grid-template-columns:minmax(0,2.1fr) minmax(245px,1fr) minmax(270px,.92fr)!important;grid-template-areas:"upcoming quick calendar" "recent recent attention" "recent recent activity"!important;gap:14px 15px!important;align-items:start!important}
html.jrvs-desktop #page-dashboard .desktop-main-column,
html.jrvs-desktop #page-dashboard .desktop-right-column{display:contents!important}
html.jrvs-desktop #page-dashboard .desktop-main-column>section:first-child{grid-area:upcoming!important;min-width:0!important}
html.jrvs-desktop #page-dashboard .desktop-main-column>section:nth-child(2){grid-area:recent!important;align-self:start!important;min-width:0!important}
html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(1){grid-area:quick!important;min-width:0!important}
html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(2){grid-area:calendar!important;min-width:0!important}
html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(3){grid-area:attention!important;min-width:0!important}
html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(4){grid-area:activity!important;min-width:0!important}
html.jrvs-desktop .desktop-card{min-width:0!important;margin:0!important;padding:15px 15px 14px!important;border:1px solid #394136!important;border-radius:14px!important;background:linear-gradient(145deg,#1d221d,#171b17)!important;box-shadow:0 7px 22px #0003!important}
html.jrvs-desktop .desktop-card-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin-bottom:12px!important}
html.jrvs-desktop .desktop-card-head h3{margin:3px 0 0!important;color:#f4f1e6!important;font-size:15px!important;line-height:1.2!important;font-weight:780!important;letter-spacing:-.2px!important}
html.jrvs-desktop .desktop-text-action{color:#d8ec76!important;font-size:10px!important;font-weight:800!important}
html.jrvs-desktop .desktop-text-action:hover{color:#f0f7b9!important}
html.jrvs-desktop .desktop-jobs-table{display:grid!important;gap:0!important;overflow:hidden!important;border:1px solid #343c32!important;border-radius:10px!important;background:#191e19!important}
html.jrvs-desktop .desktop-jobs-head,
html.jrvs-desktop .desktop-job-row{display:grid!important;grid-template-columns:76px 64px minmax(0,1.55fr) minmax(80px,.8fr) 84px!important;align-items:center!important;gap:9px!important}
html.jrvs-desktop .desktop-jobs-head{min-height:34px!important;padding:0 10px!important;background:#292e29!important;color:#c9d0c1!important;font-size:9px!important;font-weight:800!important}
html.jrvs-desktop .desktop-job-row{width:100%!important;min-width:0!important;min-height:47px!important;padding:7px 10px!important;border:0!important;border-top:1px solid #303830!important;border-radius:0!important;background:#1b201b!important;color:#ecefe4!important;text-align:left!important;cursor:pointer!important;transition:background .15s!important}
html.jrvs-desktop .desktop-job-row:hover{background:#252d24!important}
html.jrvs-desktop .desktop-job-date{color:#e6ebdb!important;font-size:10px!important;font-weight:720!important;white-space:nowrap!important}
html.jrvs-desktop .desktop-job-time{color:#bdc5b6!important;font-size:10px!important;white-space:nowrap!important}
html.jrvs-desktop .desktop-job-property{display:block!important;min-width:0!important}
html.jrvs-desktop .desktop-job-property strong{display:block!important;color:#f1f2e9!important;font-size:10px!important;font-weight:740!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html.jrvs-desktop .desktop-job-property small{display:block!important;color:#a7b09f!important;font-size:9px!important;margin-top:2px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html.jrvs-desktop .desktop-job-agent{color:#c0c8b9!important;font-size:9px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html.jrvs-desktop .desktop-status-pill{justify-self:start!important;padding:5px 8px!important;border-radius:20px!important;background:#315234!important;color:#bde5a6!important;font-size:9px!important;font-weight:800!important;white-space:nowrap!important}
html.jrvs-desktop .desktop-status-pill.pending{background:#51451e!important;color:#efdb79!important}
html.jrvs-desktop .desktop-status-pill.other{background:#3a4038!important;color:#c8d0c1!important}
html.jrvs-desktop .desktop-quick-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
html.jrvs-desktop .desktop-quick-action{min-height:74px!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:5px!important;padding:10px 12px!important;border:1px solid #383f35!important;border-radius:10px!important;background:#252b25!important;color:#f0f1e7!important;text-align:left!important;box-shadow:none!important}
html.jrvs-desktop .desktop-quick-action span{display:block!important;color:#d7e96e!important;font-size:20px!important;line-height:1!important}
html.jrvs-desktop .desktop-quick-action b{color:inherit!important;font-size:10px!important;font-weight:780!important}
html.jrvs-desktop .desktop-quick-action:hover{border-color:#798b53!important;background:#30392b!important;transform:translateY(-1px)!important}
html.jrvs-desktop .desktop-quick-action.featured{background:linear-gradient(130deg,#c7df68,#a9c84f)!important;border-color:#d0e778!important;color:#17200f!important;box-shadow:0 4px 13px #0003!important}
html.jrvs-desktop .desktop-quick-action.featured span{color:#202b14!important}
html.jrvs-desktop .desktop-calendar-card .desktop-calendar-nav button{width:27px!important;height:27px!important;border:1px solid #404a39!important;border-radius:8px!important;background:#252d24!important;color:#e4edb1!important;font-size:16px!important}
html.jrvs-desktop .desktop-calendar-grid{grid-template-columns:repeat(7,minmax(0,1fr))!important;gap:3px!important;margin:2px 0 10px!important}
html.jrvs-desktop .desktop-calendar-weekday{padding:5px 0!important;color:#a4ad98!important;font-size:9px!important;font-weight:850!important}
html.jrvs-desktop .desktop-calendar-day{height:29px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#e3e6da!important;font-size:10px!important}
html.jrvs-desktop .desktop-calendar-day.muted{color:#66705f!important}
html.jrvs-desktop .desktop-calendar-day.today{background:#a9c754!important;color:#15200f!important;font-weight:900!important}
html.jrvs-desktop .desktop-calendar-day.has-event:not(.today):after{width:4px!important;height:4px!important;background:#c1dc61!important}
html.jrvs-desktop .desktop-outline-action{min-height:31px!important;border:1px solid #424d39!important;border-radius:9px!important;background:#252d23!important;color:#d8e7ae!important;font-size:10px!important;font-weight:750!important}
html.jrvs-desktop .desktop-count-pill{background:#c1d957!important;color:#18200f!important;font-size:11px!important}
html.jrvs-desktop .desktop-attention-card .attention-list{gap:5px!important}
html.jrvs-desktop .desktop-attention-card .attention-list .row-card{background:#222821!important;border-color:#394437!important}
html.jrvs-desktop .attention-item{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:9px 10px!important;border:1px solid #374033!important;border-radius:9px!important;background:#222821!important;color:#eef0e5!important;text-align:left!important}
html.jrvs-desktop .attention-item strong{color:#eef1e7!important;font-size:10px!important}
html.jrvs-desktop .attention-item small{color:#a8b29f!important;font-size:9px!important}
html.jrvs-desktop .desktop-activity-row{display:flex!important;align-items:flex-start!important;gap:9px!important;padding:9px 0!important;border-bottom:1px solid #303830!important}
html.jrvs-desktop .desktop-activity-icon{width:27px!important;height:27px!important;flex:0 0 27px!important;border-radius:50%!important;background:#466c37!important;color:#c8ef9b!important;font-size:13px!important}
html.jrvs-desktop .desktop-activity-copy strong{color:#eff1e8!important;font-size:10px!important;font-weight:700!important}
html.jrvs-desktop .desktop-activity-copy small{color:#a4ad9a!important;font-size:9px!important}
html.jrvs-desktop .recent-job-list{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}
html.jrvs-desktop .recent-job-card{display:flex!important;flex-direction:column!important;min-width:0!important;padding:0!important;overflow:hidden!important;border:1px solid #3a4137!important;border-radius:11px!important;background:#222822!important;color:#f0f1e6!important;text-align:left!important;box-shadow:0 4px 13px #0003!important}
html.jrvs-desktop .recent-job-card:hover{border-color:#829854!important;transform:translateY(-2px)!important}
html.jrvs-desktop .recent-job-cover,
html.jrvs-desktop .recent-job-placeholder{display:block!important;width:100%!important;height:118px!important;flex:0 0 118px!important;background-size:cover!important;background-position:center!important}
html.jrvs-desktop .recent-job-placeholder{display:grid!important;place-items:center!important;background:#303a2a!important;color:#b8cb80!important}
html.jrvs-desktop .recent-job-main{display:block!important;padding:9px 10px 10px!important;min-width:0!important}
html.jrvs-desktop .recent-job-main strong{display:block!important;color:#f2f1e8!important;font-size:10px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html.jrvs-desktop .recent-job-main small{display:block!important;color:#bdc4b5!important;font-size:9px!important;margin-top:4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html.jrvs-desktop .recent-job-meta{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:6px!important;margin-top:7px!important;color:#c5d78e!important;font-size:8px!important}
html.jrvs-desktop .recent-job-meta .pill{padding:3px 6px!important;background:#35432b!important;color:#d8e9a8!important}
html.jrvs-desktop .desktop-empty{padding:23px 12px!important;border:1px dashed #3c4638!important;border-radius:10px!important;background:#1a201a!important;color:#a8b19f!important;font-size:11px!important}

html.jrvs-desktop .desktop-notification-button{position:relative!important;width:40px!important;height:40px!important;flex:0 0 40px!important;display:grid!important;place-items:center!important;border:1px solid #384136!important;border-radius:11px!important;background:#1f251f!important;color:#e5ebd8!important}
html.jrvs-desktop .desktop-notification-button:hover{background:#2a3327!important;border-color:#728650!important}
html.jrvs-desktop .desktop-notification-button i{position:absolute!important;top:6px!important;right:6px!important;width:8px!important;height:8px!important;border:1px solid #1e251b!important;border-radius:50%!important;background:#b8d75b!important}
html.jrvs-desktop .desktop-user-avatar{width:40px!important;height:40px!important;flex:0 0 40px!important;display:grid!important;place-items:center!important;border:1px solid #71804f!important;border-radius:50%!important;background:linear-gradient(145deg,#879b58,#53643a)!important;color:#f7f5e9!important;font-size:12px!important;font-weight:850!important;letter-spacing:.3px!important;box-shadow:0 3px 11px #0004!important}

html.jrvs-desktop #page-dashboard.active{display:grid!important;grid-template-columns:minmax(0,2.1fr) minmax(245px,1fr) minmax(270px,.92fr)!important;grid-template-rows:auto auto auto auto auto!important;grid-template-areas:"heading heading heading" "kpis kpis calendar" "upcoming quick calendar" "recent recent attention" "recent recent activity"!important;gap:14px 15px!important;align-content:start!important;align-items:start!important}
html.jrvs-desktop #page-dashboard.active>.desktop-dashboard-heading{grid-area:heading!important;min-width:0!important}
html.jrvs-desktop #page-dashboard.active>.desktop-kpis{grid-area:kpis!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;min-width:0!important}
html.jrvs-desktop #page-dashboard.active>.desktop-dashboard-layout{display:contents!important}
html.jrvs-desktop #page-dashboard.active .desktop-main-column,
html.jrvs-desktop #page-dashboard.active .desktop-right-column{display:contents!important}
html.jrvs-desktop #page-dashboard.active .desktop-main-column>section:first-child{grid-area:upcoming!important}
html.jrvs-desktop #page-dashboard.active .desktop-main-column>section:nth-child(2){grid-area:recent!important;align-self:start!important}
html.jrvs-desktop #page-dashboard.active .desktop-right-column>section:nth-child(1){grid-area:quick!important}
html.jrvs-desktop #page-dashboard.active .desktop-right-column>section:nth-child(2){grid-area:calendar!important;align-self:start!important}
html.jrvs-desktop #page-dashboard.active .desktop-right-column>section:nth-child(3){grid-area:attention!important}
html.jrvs-desktop #page-dashboard.active .desktop-right-column>section:nth-child(4){grid-area:activity!important}
@media(max-width:1180px){
 html.jrvs-desktop #page-dashboard.active{grid-template-columns:minmax(0,1.4fr) minmax(230px,.9fr)!important;grid-template-rows:auto auto auto auto auto auto!important;grid-template-areas:"heading heading" "kpis kpis" "upcoming quick" "calendar attention" "recent recent" "activity activity"!important}
}
@media(max-width:760px){
 html.jrvs-desktop #page-dashboard.active{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto!important;grid-template-areas:"heading" "kpis" "upcoming" "quick" "calendar" "recent" "attention" "activity"!important}
 html.jrvs-desktop #page-dashboard.active>.desktop-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}

html.jrvs-desktop body.jrvs-dashboard-active .version.desktop-version-action{display:none!important}
@media(max-width:1450px){
 html.jrvs-desktop .shell{grid-template-columns:226px minmax(0,1fr)!important}
 html.jrvs-desktop .shell>main{padding:20px 18px 24px!important}
 html.jrvs-desktop #page-dashboard .desktop-dashboard-layout{grid-template-columns:minmax(0,1.9fr) minmax(225px,.95fr) minmax(245px,.9fr)!important;gap:11px!important}
 html.jrvs-desktop .desktop-card{padding:13px!important}
 html.jrvs-desktop .desktop-job-row,html.jrvs-desktop .desktop-jobs-head{grid-template-columns:66px 54px minmax(0,1.5fr) minmax(68px,.7fr) 78px!important;gap:6px!important}
}
@media(max-width:1180px){
 html.jrvs-desktop #page-dashboard .desktop-dashboard-layout{grid-template-columns:minmax(0,1.4fr) minmax(230px,.9fr)!important;grid-template-areas:"upcoming quick" "recent recent" "calendar attention" "activity activity"!important}
 html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(2){grid-area:calendar!important}
 html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(3){grid-area:attention!important}
 html.jrvs-desktop #page-dashboard .desktop-right-column>section:nth-child(4){grid-area:activity!important}
 html.jrvs-desktop .recent-job-list{grid-template-columns:repeat(4,minmax(0,1fr))!important}
}
@media(max-width:900px){
 html.jrvs-desktop .shell{grid-template-columns:1fr!important;grid-template-rows:auto minmax(0,1fr)!important}
 html.jrvs-desktop .shell>aside{grid-column:1!important;grid-row:1!important;height:auto!important;min-height:0!important;padding:9px 12px!important;gap:8px!important}
 html.jrvs-desktop .brand{display:none!important}
 html.jrvs-desktop .shell>aside>div:first-of-type{width:100%!important}
 html.jrvs-desktop .shell>aside nav{display:flex!important;overflow-x:auto!important;gap:5px!important}
 html.jrvs-desktop .shell>aside .nav-btn{white-space:nowrap!important;min-height:39px!important;padding:0 10px!important;font-size:11px!important}
 html.jrvs-desktop .desktop-storage-card{display:none!important}
 html.jrvs-desktop .shell>main{grid-column:1!important;grid-row:2!important;padding:16px!important}
}
@media(max-width:760px){
 html.jrvs-desktop .desktop-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 html.jrvs-desktop #page-dashboard .desktop-dashboard-layout{grid-template-columns:1fr!important;grid-template-areas:"upcoming" "quick" "calendar" "recent" "attention" "activity"!important}
 html.jrvs-desktop .recent-job-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 html.jrvs-desktop .top-tools .global-search{min-width:0!important;width:min(54vw,330px)!important}
 html.jrvs-desktop .top-tools .header-actions{display:none!important}
 html.jrvs-desktop body.jrvs-dashboard-active .top-tools{right:16px!important;top:10px!important}
 html.jrvs-desktop .desktop-dashboard-heading h2{font-size:22px!important}
 html.jrvs-desktop .desktop-jobs-head{display:none!important}
 html.jrvs-desktop .desktop-job-row{grid-template-columns:minmax(0,1fr) auto!important}
 html.jrvs-desktop .desktop-job-time,html.jrvs-desktop .desktop-job-agent{display:none!important}
 html.jrvs-desktop .desktop-job-property{grid-column:1!important}
 html.jrvs-desktop .desktop-status-pill{grid-column:2!important;grid-row:1!important}
}

html.jrvs-desktop .desktop-version-action{white-space:nowrap!important}
html.jrvs-desktop .panel,
html.jrvs-desktop .stat,
html.jrvs-desktop .row-card,
html.jrvs-desktop .project-card,
html.jrvs-desktop .project-info,
html.jrvs-desktop .settings-card,
html.jrvs-desktop .settings-note,
html.jrvs-desktop .quote-panel,
html.jrvs-desktop .quote-stat,
html.jrvs-desktop .quote-card,
html.jrvs-desktop .package-card,
html.jrvs-desktop .finance-stat,
html.jrvs-desktop .finance-linked-card,
html.jrvs-desktop .finance-panel,
html.jrvs-desktop .calendar-panel,
html.jrvs-desktop .photo-card,
html.jrvs-desktop .photo-info,
html.jrvs-desktop .client-contact-card,
html.jrvs-desktop .client-profile-notes,
html.jrvs-desktop .job-detail-stat,
html.jrvs-desktop .job-detail-info div,
html.jrvs-desktop .job-detail-notes,
html.jrvs-desktop .attention-item,
html.jrvs-desktop .batch-tools,
html.jrvs-desktop .media-toolbar,
html.jrvs-desktop .empty,
html.jrvs-desktop .quote-empty{background:#1b221c!important;border-color:#394637!important;color:#edf1e8!important;box-shadow:0 8px 24px #0003!important}
html.jrvs-desktop .photo-info strong,
html.jrvs-desktop .photo-info .photo-name{color:#f0f3e9!important}
html.jrvs-desktop .photo-meta,
html.jrvs-desktop .photo-info small{color:#aab5a2!important}
html.jrvs-desktop .job-workflow-actions,
html.jrvs-desktop .batch-studio{background:#1d251e!important;border:1px solid #3d4937!important;color:#e8eee0!important}
html.jrvs-desktop .job-workflow-actions label,
html.jrvs-desktop .batch-studio label{color:#c5d0b8!important}
html.jrvs-desktop .photo-select-wrap{background:#273324!important;color:#e9efdc!important;border-color:#80945f!important}
html.jrvs-desktop .photo-preview-action{background:#202b22e8!important;color:#e8f0d9!important;border-color:#718656!important}
html.jrvs-desktop .photo-cover-badge{background:#35432e!important;color:#e2ecbf!important;border-color:#718656!important}
html.jrvs-desktop .calendar-grid .cal-weekday{background:#202920!important;color:#bfcaaa!important}
html.jrvs-desktop .calendar-grid .cal-cell{background:#171e18!important;color:#dfe5d7!important;border-color:#394637!important}
html.jrvs-desktop .quote-stat-icon{background:#30402b!important;color:#d8e8aa!important}
html.jrvs-desktop .finance-status,
html.jrvs-desktop .job-status-pill{background:#30402b!important;color:#d8e8aa!important}
html.jrvs-desktop .quote-total{background:#20291f!important;color:#eff3e8!important;border:1px solid #465441!important}
html.jrvs-desktop .editor-panel,
html.jrvs-desktop .editor-panel details,
html.jrvs-desktop .editor-history{background:#1d251f!important;color:#edf1e8!important;border-color:#3b4839!important}
html.jrvs-desktop .editor-panel-heading,
html.jrvs-desktop .editor-panel .editor-control label,
html.jrvs-desktop .editor-panel details summary{color:#e7ecdf!important}
@media(max-width:1100px){html.jrvs-desktop #page-quotes .package-grid{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))!important}}
@media(max-width:650px){html.jrvs-desktop #page-quotes .package-grid{grid-template-columns:1fr!important}html.jrvs-desktop #quoteLines .quote-line{grid-template-columns:minmax(0,1fr) 62px 90px 30px!important}}

</style>

<style id="jrvs-desktop-v053-reference-polish">
/* Reference design refinement: stronger hierarchy, roomier controls and balanced dashboard proportions. */
html.jrvs-desktop .shell>aside{padding:23px 16px 16px!important;gap:23px!important}
html.jrvs-desktop .brand img{width:188px!important;height:112px!important}
html.jrvs-desktop .shell>aside .nav-btn{min-height:49px!important;padding:0 14px!important;font-size:13px!important;gap:14px!important}
html.jrvs-desktop .shell>aside .nav-btn span:first-child{font-size:19px!important}
html.jrvs-desktop .shell>main{padding:24px 24px 30px!important}
html.jrvs-desktop #page-dashboard.active{column-gap:17px!important;row-gap:16px!important}
html.jrvs-desktop .desktop-dashboard-heading{min-height:80px!important;margin-bottom:2px!important}
html.jrvs-desktop .desktop-dashboard-heading h2{font-size:32px!important;line-height:1.14!important;letter-spacing:-1px!important}
html.jrvs-desktop .desktop-dashboard-heading p{font-size:13px!important;line-height:1.4!important}
html.jrvs-desktop .desktop-kicker{font-size:9px!important;letter-spacing:1.9px!important}
html.jrvs-desktop .desktop-kpis{gap:13px!important;margin:0!important}
html.jrvs-desktop .desktop-kpi{min-height:94px!important;padding:15px 17px!important;gap:13px!important;border-radius:15px!important}
html.jrvs-desktop .desktop-kpi-icon{width:50px!important;height:50px!important;flex-basis:50px!important;border-radius:13px!important;font-size:23px!important}
html.jrvs-desktop .desktop-kpi span{font-size:9px!important;letter-spacing:1.1px!important}
html.jrvs-desktop .desktop-kpi strong{font-size:29px!important;margin:4px 0 2px!important}
html.jrvs-desktop .desktop-kpi small{font-size:10px!important}
html.jrvs-desktop .desktop-card{padding:17px 17px 16px!important;border-radius:15px!important}
html.jrvs-desktop .desktop-card-head{margin-bottom:14px!important}
html.jrvs-desktop .desktop-card-head h3{font-size:16px!important;letter-spacing:-.25px!important}
html.jrvs-desktop .desktop-text-action{font-size:10px!important}
html.jrvs-desktop .desktop-jobs-head,html.jrvs-desktop .desktop-job-row{grid-template-columns:78px 64px minmax(0,1.55fr) minmax(82px,.8fr) 88px!important;gap:9px!important}
html.jrvs-desktop .desktop-jobs-head{min-height:36px!important;padding:0 11px!important;font-size:10px!important}
html.jrvs-desktop .desktop-job-row{min-height:51px!important;padding:8px 11px!important}
html.jrvs-desktop .desktop-job-date,html.jrvs-desktop .desktop-job-time{font-size:10px!important}
html.jrvs-desktop .desktop-job-property strong{font-size:11px!important}
html.jrvs-desktop .desktop-job-property small{font-size:10px!important}
html.jrvs-desktop .desktop-job-agent{font-size:10px!important}
html.jrvs-desktop .desktop-status-pill{font-size:9px!important;padding:5px 9px!important}
html.jrvs-desktop .desktop-quick-grid{gap:9px!important}
html.jrvs-desktop .desktop-quick-action{min-height:78px!important;padding:11px 13px!important;gap:6px!important;border-radius:11px!important}
html.jrvs-desktop .desktop-quick-action span{font-size:22px!important}
html.jrvs-desktop .desktop-quick-action b{font-size:10px!important}
html.jrvs-desktop .desktop-calendar-card .desktop-card-head h3{font-size:16px!important}
html.jrvs-desktop .desktop-calendar-grid{gap:4px!important;margin:4px 0 12px!important}
html.jrvs-desktop .desktop-calendar-weekday{font-size:9px!important;padding:6px 0!important}
html.jrvs-desktop .desktop-calendar-day{height:31px!important;font-size:10px!important;border-radius:9px!important}
html.jrvs-desktop .desktop-outline-action{min-height:34px!important;font-size:10px!important}
html.jrvs-desktop .desktop-count-pill{min-width:27px!important;height:27px!important;font-size:11px!important}
html.jrvs-desktop .attention-item{padding:10px 11px!important}
html.jrvs-desktop .attention-item strong{font-size:11px!important}
html.jrvs-desktop .attention-item small{font-size:10px!important}
html.jrvs-desktop .recent-job-list{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:11px!important}
html.jrvs-desktop .recent-job-cover,html.jrvs-desktop .recent-job-placeholder{height:132px!important;flex-basis:132px!important}
html.jrvs-desktop .recent-job-main{padding:10px 11px 11px!important}
html.jrvs-desktop .recent-job-main strong{font-size:11px!important}
html.jrvs-desktop .recent-job-main small{font-size:10px!important}
html.jrvs-desktop .recent-job-meta{font-size:9px!important;gap:7px!important}
html.jrvs-desktop .desktop-activity-row{gap:10px!important;padding:10px 0!important}
html.jrvs-desktop .desktop-activity-icon{width:29px!important;height:29px!important;flex-basis:29px!important;font-size:14px!important}
html.jrvs-desktop .desktop-activity-copy strong{font-size:11px!important}
html.jrvs-desktop .desktop-activity-copy small{font-size:10px!important}
html.jrvs-desktop .desktop-empty{padding:26px 14px!important;font-size:12px!important;line-height:1.5!important}
#editorBackdrop .jrvs-property-finish-card{gap:9px!important;background:linear-gradient(145deg,#2a3829,#202a21)!important;border-color:#64794b!important;box-shadow:0 8px 20px #0004!important}
#editorBackdrop .jrvs-property-finish-card .jrvs-auto-enhance-copy strong{font-size:13px!important;color:#f3f5e9!important}
#editorBackdrop .jrvs-property-finish-card .jrvs-auto-enhance-copy span{font-size:10px!important;line-height:1.5!important;color:#c6d2b9!important}
#editorBackdrop .jrvs-finish-intent-label{font-size:8px!important;font-weight:850!important;letter-spacing:.14em!important;color:#c1d18f!important}
#editorBackdrop .jrvs-finish-intent{width:100%!important;min-height:35px!important;padding:7px 9px!important;border:1px solid #526248!important;border-radius:8px!important;background:#151d16!important;color:#eaf0e3!important;font-size:10px!important}
#editorBackdrop .jrvs-property-finish-card .jrvs-auto-enhance-button{min-height:40px!important;background:linear-gradient(120deg,#bed76d,#9fbc58)!important;border:1px solid #cde77d!important;color:#17200f!important;font-weight:900!important}
#editorBackdrop .jrvs-finish-report{padding:9px 10px!important;border:1px solid #46533d!important;border-radius:8px!important;background:#182119!important;color:#d3dfc5!important;font-size:9px!important;line-height:1.55!important}
#editorBackdrop .jrvs-property-finish-card .jrvs-auto-enhance-note{font-size:8px!important;color:#aab89e!important}
#editorBackdrop .jrvs-property-batch-tools{display:grid!important;grid-template-columns:1fr!important;gap:7px!important}
#editorBackdrop .jrvs-property-batch-tools button{min-height:34px!important;font-size:10px!important}
#editorBackdrop .jrvs-room-match-button{background:#35452e!important;border:1px solid #718a4f!important;color:#e5f1c3!important;font-weight:850!important}
#editorBackdrop .jrvs-room-match-button:hover{background:#435638!important;border-color:#a8c568!important}
#editorBackdrop .jrvs-room-match-help{margin:-4px 0 8px!important;color:#aebaa6!important;font-size:9px!important;line-height:1.55!important}

html.jrvs-desktop .desktop-empty-state{grid-column:1/-1!important;min-width:0!important;min-height:160px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:16px!important;padding:22px 24px!important;border:1px dashed #414c3b!important;border-radius:12px!important;background:radial-gradient(ellipse at 50% 0%,#293325 0%,#1a201a 72%)!important;color:#eaf0de!important;text-align:left!important}
html.jrvs-desktop .desktop-empty-state.compact{min-height:112px!important;padding:15px 18px!important;gap:13px!important}
html.jrvs-desktop .desktop-empty-symbol{width:44px!important;height:44px!important;flex:0 0 44px!important;display:grid!important;place-items:center!important;border:1px solid #5a6b44!important;border-radius:13px!important;background:#35442c!important;color:#d5e879!important;font-size:22px!important}
html.jrvs-desktop .desktop-empty-copy{min-width:0!important}
html.jrvs-desktop .desktop-empty-copy strong{display:block!important;color:#f0f3e8!important;font-size:12px!important;font-weight:800!important}
html.jrvs-desktop .desktop-empty-copy p{margin:5px 0 0!important;color:#aeb9a3!important;font-size:10px!important;line-height:1.5!important}
html.jrvs-desktop .desktop-empty-cta{min-height:34px!important;flex:none!important;padding:0 12px!important;border:1px solid #c5dd71!important;border-radius:9px!important;background:#b9d260!important;color:#1c2512!important;font-size:10px!important;font-weight:850!important}
html.jrvs-desktop .desktop-empty-cta:hover{background:#d0e97b!important;transform:translateY(-1px)!important}
html.jrvs-desktop .desktop-activity-empty{min-height:82px!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important}
@media(max-width:900px){html.jrvs-desktop .desktop-empty-state{min-height:125px!important;padding:16px!important;gap:11px!important}html.jrvs-desktop .desktop-empty-state.compact{min-height:105px!important}html.jrvs-desktop .desktop-empty-symbol{width:38px!important;height:38px!important;flex-basis:38px!important}}

@media(max-width:1450px){
 html.jrvs-desktop .shell>main{padding:20px 19px 25px!important}
 html.jrvs-desktop #page-dashboard.active{column-gap:13px!important;row-gap:13px!important}
 html.jrvs-desktop .desktop-card{padding:14px!important}
 html.jrvs-desktop .desktop-kpi{padding:12px!important;gap:10px!important}
 html.jrvs-desktop .desktop-kpi-icon{width:44px!important;height:44px!important;flex-basis:44px!important}
 html.jrvs-desktop .desktop-kpi strong{font-size:26px!important}
 html.jrvs-desktop .desktop-job-row,html.jrvs-desktop .desktop-jobs-head{grid-template-columns:70px 55px minmax(0,1.5fr) minmax(68px,.7fr) 78px!important;gap:6px!important}
 html.jrvs-desktop .recent-job-cover,html.jrvs-desktop .recent-job-placeholder{height:116px!important;flex-basis:116px!important}
}
@media(max-width:1180px){
 html.jrvs-desktop #page-dashboard.active{grid-template-columns:minmax(0,1.4fr) minmax(245px,.95fr)!important;grid-template-rows:auto auto auto auto auto auto!important;grid-template-areas:"heading heading" "kpis kpis" "upcoming quick" "calendar attention" "recent recent" "activity activity"!important}
 html.jrvs-desktop #page-dashboard.active>.desktop-kpis{grid-template-columns:repeat(4,minmax(0,1fr))!important}
 html.jrvs-desktop .desktop-job-row,html.jrvs-desktop .desktop-jobs-head{grid-template-columns:70px minmax(0,1fr) 80px!important}
 html.jrvs-desktop .desktop-job-time,html.jrvs-desktop .desktop-job-agent{display:none!important}
 html.jrvs-desktop .desktop-job-property{grid-column:2!important}
}
@media(max-width:900px){
 html.jrvs-desktop .shell>main{padding:15px!important}
 html.jrvs-desktop #page-dashboard.active{grid-template-columns:minmax(0,1fr)!important;grid-template-areas:"heading" "kpis" "upcoming" "quick" "calendar" "recent" "attention" "activity"!important}
 html.jrvs-desktop #page-dashboard.active>.desktop-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 html.jrvs-desktop .desktop-dashboard-heading h2{font-size:25px!important}
 html.jrvs-desktop .recent-job-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}

/* V0.53.1 — finish the dark photo-library treatment. */
html.jrvs-desktop #page-photos .media-workspace,
html.jrvs-desktop #page-photos .jrvs-gallery-head,
html.jrvs-desktop #page-photos .jrvs-photo-card,
html.jrvs-desktop #page-photos .jrvs-photo-card .photo-info,
html.jrvs-desktop #page-photos .project-card,
html.jrvs-desktop #page-photos .project-info,
html.jrvs-desktop #page-photos .jrvs-gallery-stats,
html.jrvs-desktop #page-photos .jrvs-gallery-actions,
html.jrvs-desktop #page-photos .batch-tools{
 background:#1b221c!important;
 border-color:#3b4839!important;
 color:#edf1e8!important;
 box-shadow:0 8px 24px #0003!important;
}
html.jrvs-desktop #page-photos .media-toolbar{
 background:#202920!important;border-color:#3c4939!important;color:#edf1e8!important;
}
html.jrvs-desktop #page-photos .media-guidance{
 background:#252e24!important;border:1px solid #394637!important;border-radius:10px!important;
 color:#c2ccb8!important;padding:13px!important;
}
html.jrvs-desktop #page-photos .media-guidance-icon{
 background:#35452d!important;color:#d9e9ad!important;
}
html.jrvs-desktop #page-photos .media-field span,
html.jrvs-desktop #page-photos .photo-status-field span,
html.jrvs-desktop #page-photos .gallery-kicker{
 color:#b5c88b!important;
}
html.jrvs-desktop #page-photos .media-field select,
html.jrvs-desktop #page-photos .media-field input,
html.jrvs-desktop #page-photos .photo-status-field select,
html.jrvs-desktop #page-photos .jrvs-gallery-stats button,
html.jrvs-desktop #page-photos .jrvs-finish-intent{
 background:#111813!important;color:#edf1e8!important;border-color:#465341!important;
}
html.jrvs-desktop #page-photos .jrvs-gallery-title h3,
html.jrvs-desktop #page-photos .jrvs-selection-label strong,
html.jrvs-desktop #page-photos .jrvs-photo-title strong,
html.jrvs-desktop #page-photos .project-info strong{
 color:#f0f3e9!important;
}
html.jrvs-desktop #page-photos .jrvs-gallery-title p,
html.jrvs-desktop #page-photos .jrvs-selection-label span,
html.jrvs-desktop #page-photos .project-meta,
html.jrvs-desktop #page-photos .photo-meta{
 color:#aab6a1!important;
}
html.jrvs-desktop #page-photos .jrvs-gallery-stats button.active{
 background:#35442d!important;border-color:#82985c!important;box-shadow:inset 0 0 0 1px #82985c!important;
}
html.jrvs-desktop #page-photos .jrvs-gallery-stats strong{color:#dce9b9!important}
html.jrvs-desktop #page-photos .jrvs-gallery-stats span{color:#b8c3ae!important}
html.jrvs-desktop #page-photos .jrvs-photo-card .photo-image-wrap,
html.jrvs-desktop #page-photos .jrvs-photo-card .photo-thumb,
html.jrvs-desktop #page-photos .project-placeholder{
 background:#151c16!important;
}
html.jrvs-desktop #page-photos .jrvs-type-pill,
html.jrvs-desktop #page-photos .photo-file-type{
 background:#303c2c!important;color:#d7e5ba!important;border-color:#4c6040!important;
}
html.jrvs-desktop #page-photos .jrvs-type-pill.edited{
 background:#263b2d!important;color:#bfe0b9!important;
}
html.jrvs-desktop #page-photos .jrvs-photo-select{
 background:#222c22!important;color:#dfe8d4!important;border-color:#687a56!important;
}
html.jrvs-desktop #page-photos .jrvs-photo-select.selected{
 background:#a9c66c!important;color:#172012!important;border-color:#c1d98c!important;
}
html.jrvs-desktop #page-photos .jrvs-action-buttons button:disabled{
 background:#252d25!important;color:#74806f!important;border-color:#374237!important;opacity:.55!important;
}
html.jrvs-desktop #page-photos .batch-tools summary,
html.jrvs-desktop #page-photos .batch-tools summary span{color:#e0e8d6!important}
html.jrvs-desktop #page-photos .batch-tools-content{background:#1b221c!important;color:#edf1e8!important}


/* V0.53 dashboard: use the property workspace width intelligently. */
html.jrvs-desktop #recentJobs:has(> .recent-job-card:nth-child(2)){
 grid-template-columns:repeat(auto-fit,minmax(225px,1fr))!important;
 align-items:stretch!important;
}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child){
 display:grid!important;grid-template-columns:minmax(0,1fr)!important;
}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card{
 display:grid!important;
 grid-template-columns:minmax(190px,245px) minmax(0,1fr) 24px!important;
 grid-template-rows:minmax(0,1fr)!important;
 align-items:center!important;gap:17px!important;
 min-height:145px!important;padding:12px!important;
}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-cover,
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-placeholder{
 grid-column:1!important;grid-row:1!important;
 width:100%!important;height:120px!important;min-height:120px!important;
 border-radius:10px!important;background-size:cover!important;background-position:center!important;
}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-main{
 grid-column:2!important;grid-row:1!important;display:flex!important;
 flex-direction:column!important;justify-content:center!important;gap:7px!important;
 min-width:0!important;padding:8px 0!important;
}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-main strong{font-size:15px!important}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-main small{font-size:11px!important}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-meta{font-size:10px!important;gap:10px!important}
html.jrvs-desktop #recentJobs:has(> .recent-job-card:only-child)>.recent-job-card>.recent-job-arrow{
 grid-column:3!important;grid-row:1!important;align-self:center!important;
}


/* V0.53 shared desktop scroll fix — all tabs scroll inside the main workspace. */
html.jrvs-desktop,
html.jrvs-desktop body{
 height:100%!important;
 min-height:100%!important;
 overflow:hidden!important;
}
html.jrvs-desktop .shell{
 display:grid!important;
 height:100vh!important;
 min-height:0!important;
 grid-template-rows:minmax(0,1fr)!important;
 align-items:stretch!important;
 overflow:hidden!important;
}
html.jrvs-desktop .shell>main{
 grid-column:2!important;
 grid-row:1!important;
 align-self:stretch!important;
 height:100%!important;
 max-height:100vh!important;
 min-height:0!important;
 box-sizing:border-box!important;
 overflow-y:auto!important;
 overflow-x:hidden!important;
 overscroll-behavior-y:contain!important;
 scrollbar-gutter:stable;
}
html.jrvs-desktop .shell>main>.page.active{
 min-height:min-content!important;
 height:auto!important;
 overflow:visible!important;
}
html.jrvs-desktop .shell>aside{
 align-self:stretch!important;
 min-height:0!important;
 max-height:100vh!important;
 overflow-y:auto!important;
 overscroll-behavior-y:contain!important;
}
html.jrvs-desktop .shell>main::-webkit-scrollbar,
html.jrvs-desktop .shell>aside::-webkit-scrollbar{width:11px!important}
html.jrvs-desktop .shell>main::-webkit-scrollbar-track,
html.jrvs-desktop .shell>aside::-webkit-scrollbar-track{background:#111711!important}
html.jrvs-desktop .shell>main::-webkit-scrollbar-thumb,
html.jrvs-desktop .shell>aside::-webkit-scrollbar-thumb{background:#536344!important;border:2px solid #111711!important;border-radius:10px!important}
html.jrvs-desktop .shell>main::-webkit-scrollbar-thumb:hover,
html.jrvs-desktop .shell>aside::-webkit-scrollbar-thumb:hover{background:#82985d!important}

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
const desktopDataToolsInjection = "\n<script id=\"jrvs-desktop-data-tools\">\n(function(){\n const invoke=window.__TAURI__?.core?.invoke;\n const status=()=>document.getElementById('jrvsDesktopDataStatus');\n function setStatus(message,error=false){const el=status();if(el){el.textContent=message;el.classList.toggle('error',!!error)}}\n function b64ToBlob(value,type){\n  const binary=atob(value||'');const bytes=new Uint8Array(binary.length);\n  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);\n  return new Blob([bytes],{type:type||'application/octet-stream'});\n }\n async function sha256Hex(blob){\n  if(!window.crypto?.subtle)throw new Error('Secure SHA-256 checks are unavailable in this Windows WebView. Update WebView2 before creating or importing a backup.');\n  const digest=await window.crypto.subtle.digest('SHA-256',await blob.arrayBuffer());\n  return Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');\n }\n async function sha256Text(value){return sha256Hex(new Blob([value],{type:'application/json'}))}\n function dateStamp(){return new Date().toISOString().slice(0,10)}\n async function downloadPayload(payload,name){\n  const json=JSON.stringify(payload);\n  if(!('CompressionStream' in window))throw new Error('This Windows WebView does not support compressed backups.');\n  const blob=await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).blob();\n  const url=URL.createObjectURL(blob),a=document.createElement('a');\n  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();\n  setTimeout(()=>URL.revokeObjectURL(url),60000);\n  return blob.size;\n }\n async function readPayload(file){\n  const bytes=await file.arrayBuffer();\n  const view=new Uint8Array(bytes);\n  if(view[0]===0x1f&&view[1]===0x8b){\n   if(!('DecompressionStream' in window))throw new Error('Compressed import files require a current version of Windows WebView2.');\n   return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());\n  }\n  return JSON.parse(new TextDecoder().decode(bytes));\n }\n async function createBackupPayload(){\n  const business=JSON.parse(localStorage.getItem('jrvs-data')||'{}');\n  const calendar=JSON.parse(localStorage.getItem('jrvs-calendar')||'[]');\n  const records=await photoRequest('readonly','all');\n  const photos=[];\n  for(let i=0;i<records.length;i++){\n   const photo=records[i];if(!photo?.blob)throw new Error('Photo '+(photo?.name||photo?.id||i+1)+' has no original file. Backup stopped.');\n   const metadata={...photo};delete metadata.blob;delete metadata.previewBlob;\n   for(const key of ['url','previewUrl','objectUrl','previewObjectUrl'])delete metadata[key];\n   const originalSha256=await sha256Hex(photo.blob);\n   const previewSha256=photo.previewBlob?await sha256Hex(photo.previewBlob):null;\n   photos.push({...metadata,blobMimeType:photo.blob.type||photo.mimeType||'application/octet-stream',previewMimeType:photo.previewBlob?.type||null,originalByteLength:photo.blob.size,previewByteLength:photo.previewBlob?.size||0,originalSha256,previewSha256,blobBase64:await jrvsPhotoBase64(photo.blob),previewBase64:photo.previewBlob?await jrvsPhotoBase64(photo.previewBlob):null});\n   if((i+1)%10===0)setStatus('Preparing full backup · '+(i+1)+' of '+records.length+' photos…');\n  }\n  const manifest={hashAlgorithm:'SHA-256',photoCount:photos.length,businessSha256:await sha256Text(JSON.stringify(business)),calendarSha256:await sha256Text(JSON.stringify(calendar)),originalPhotoBytes:photos.reduce((sum,photo)=>sum+(photo.originalByteLength||0),0),previewPhotoBytes:photos.reduce((sum,photo)=>sum+(photo.previewByteLength||0),0)};\n  return {format:'jrvs-portable-workspace',formatVersion:2,appVersion:'0.53.0',exportedAt:new Date().toISOString(),business,calendar,photos,hasPhotoLibrary:true,manifest};\n }\n window.jrvsCreateDesktopBackup=async function(){\n  const button=document.querySelector('.desktop-migration-card button[onclick=\"jrvsCreateDesktopBackup()\"]');\n  if(button){button.disabled=true;button.textContent='Creating…'}\n  try{\n   setStatus('Preparing the database and photo library for backup…');\n   const payload=await createBackupPayload();\n   const size=await downloadPayload(payload,'JRVS-Backup-'+dateStamp()+'.jrvsbackup.gz');\n   setStatus('Backup created · '+(payload.business.jobs?.length||0)+' jobs · '+(payload.business.clients?.length||0)+' clients · '+payload.photos.length+' photos · '+(size/1048576).toFixed(1)+' MB');\n   if(typeof showToast==='function')showToast('Your complete JRVS backup has been created.');\n  }catch(error){console.error(error);setStatus('Backup failed: '+(error?.message||error),true);if(typeof showToast==='function')showToast('JRVS backup failed. '+(error?.message||error),'error')}\n  finally{if(button){button.disabled=false;button.textContent='Create backup'}}\n };\n window.jrvsImportWorkspaceFile=async function(input){\n  const file=input?.files?.[0];if(!file)return;\n  input.disabled=true;\n  try{\n   setStatus('Reading and validating the selected workspace file…');\n   const payload=await readPayload(file);\n   if(!['jrvs-legacy-workspace','jrvs-portable-workspace'].includes(payload?.format)||![1,2].includes(payload.formatVersion))throw new Error('This is not a supported JRVS migration or backup file.');\n   if(!payload.business||typeof payload.business!=='object'||Array.isArray(payload.business))throw new Error('The file does not contain a valid JRVS business workspace.');\n   if(!Array.isArray(payload.calendar))throw new Error('The file does not contain a valid JRVS calendar.');\n   if(!Array.isArray(payload.photos))throw new Error('The file does not contain a photo-library list.');\n   const seenPhotoIds=new Set();\n   if(payload.formatVersion===2){\n    const manifest=payload.manifest;\n    if(!manifest||manifest.hashAlgorithm!=='SHA-256'||manifest.photoCount!==payload.photos.length)throw new Error('The backup integrity manifest is missing or inconsistent.');\n    if(await sha256Text(JSON.stringify(payload.business))!==manifest.businessSha256)throw new Error('Business records failed their SHA-256 integrity check. No data has been imported.');\n    if(await sha256Text(JSON.stringify(payload.calendar))!==manifest.calendarSha256)throw new Error('Calendar events failed their SHA-256 integrity check. No data has been imported.');\n   }\n   let actualOriginalBytes=0,actualPreviewBytes=0;\n   for(let i=0;i<payload.photos.length;i++){\n    const photo=payload.photos[i];\n    if(!photo||photo.id==null||!photo.blobBase64)throw new Error('Photo '+(i+1)+' is incomplete. Import stopped without replacing the current workspace.');\n    const photoId=String(photo.id);\n    if(seenPhotoIds.has(photoId))throw new Error('The backup contains a duplicate photo ID ('+photoId+'). No data has been imported.');\n    seenPhotoIds.add(photoId);\n    if(payload.formatVersion===2){\n     const original=b64ToBlob(photo.blobBase64,photo.blobMimeType||photo.mimeType||'application/octet-stream');\n     actualOriginalBytes+=original.size;\n     if(original.size!==photo.originalByteLength||await sha256Hex(original)!==photo.originalSha256)throw new Error('Photo '+(photo.name||photoId)+' failed its original-file integrity check. No data has been imported.');\n     if(photo.previewBase64){\n      const preview=b64ToBlob(photo.previewBase64,photo.previewMimeType||'image/jpeg');\n      actualPreviewBytes+=preview.size;\n      if(preview.size!==photo.previewByteLength||await sha256Hex(preview)!==photo.previewSha256)throw new Error('Photo '+(photo.name||photoId)+' failed its preview integrity check. No data has been imported.');\n     }else if(photo.previewSha256||photo.previewByteLength)throw new Error('Photo '+(photo.name||photoId)+' has inconsistent preview metadata.');\n    }\n   }\n   if(payload.formatVersion===2&&(actualOriginalBytes!==payload.manifest.originalPhotoBytes||actualPreviewBytes!==payload.manifest.previewPhotoBytes))throw new Error('Photo-library byte totals do not match the integrity manifest. No data has been imported.');\n   const summary=[\n    (payload.business.jobs||[]).length+' jobs',(payload.business.clients||[]).length+' clients',\n    (payload.business.quotes||[]).length+' quotes',(payload.business.invoices||[]).length+' invoices',\n    payload.calendar.length+' calendar events',payload.photos.length+' photos'\n   ].join(' · ');\n   const ok=await showConfirm('Import '+summary+'? Your current desktop records will be replaced. JRVS will download a full safety backup first. The original browser data is not changed.',{title:'Import JRVS workspace',confirmText:'Back up and import',danger:false});\n   if(!ok){input.value='';return}\n   setStatus('Creating a safety backup of the current desktop workspace…');\n   const before=await createBackupPayload();\n   await downloadPayload(before,'JRVS-Before-Import-'+dateStamp()+'.jrvsbackup.gz');\n   setStatus('Copying photo originals into the managed JRVS library…');\n   const importedIds=new Set();\n   for(let i=0;i<payload.photos.length;i++){\n    const source=payload.photos[i],photo={...source};\n    photo.blob=b64ToBlob(source.blobBase64,source.blobMimeType||source.mimeType||'application/octet-stream');\n    photo.previewBlob=source.previewBase64?b64ToBlob(source.previewBase64,source.previewMimeType||'image/jpeg'):null;\n    delete photo.blobBase64;delete photo.previewBase64;importedIds.add(String(photo.id));\n    setStatus('Copying photo originals into the managed JRVS library · '+(i+1)+' of '+payload.photos.length+'…');\n    await photoRequest('readwrite','put',photo);\n   }\n   if(window.__JRVS_MANAGED_PHOTO_FLUSH__)await window.__JRVS_MANAGED_PHOTO_FLUSH__();\n   setStatus('Committing business records into the local SQLite workspace…');\n   await invoke('desktop_import_legacy_workspace',{businessJson:JSON.stringify(payload.business),calendarJson:JSON.stringify(payload.calendar)});\n   if(payload.hasPhotoLibrary){\n    const existing=await photoRequest('readonly','all');\n    for(const photo of existing||[])if(!importedIds.has(String(photo.id)))await photoRequest('readwrite','delete',photo.id);\n   }\n   if(window.__JRVS_MANAGED_PHOTO_FLUSH__)await window.__JRVS_MANAGED_PHOTO_FLUSH__();\n   const storage=window.__JRVS_NATIVE_STORAGE__;\n   if(storage){storage.replace({'jrvs-data':JSON.stringify(payload.business),'jrvs-calendar':JSON.stringify(payload.calendar)});await storage.flush()}\n   await refreshNativeStatus();\n   setStatus('Import complete · '+summary+'. Local database and managed photo copies are ready.');\n   if(typeof showToast==='function')showToast('JRVS workspace imported successfully. Reloading…');\n   input.value='';\n   setTimeout(()=>location.reload(),900);\n  }catch(error){\n   console.error('JRVS workspace import failed',error);\n   setStatus('Import stopped: '+(error?.message||error)+'. Check the safety backup in Downloads before retrying.',true);\n   if(typeof showToast==='function')showToast('JRVS import stopped. '+(error?.message||error),'error');\n   input.value='';\n  }finally{input.disabled=false;refreshNativeStatus()}\n };\n async function refreshNativeStatus(){\n  if(!invoke)return;\n  try{\n   const info=await invoke('desktop_storage_status');\n   const size=(Number(info.managedPhotoBytes)||0)/1048576;\n   if(window.__JRVS_MANAGED_PHOTO_ERROR__)throw new Error('Managed photo storage needs attention: '+window.__JRVS_MANAGED_PHOTO_ERROR__);\n   const el=status();\n   if(el&&!el.textContent.startsWith('Import')&&!el.textContent.startsWith('Backup'))el.textContent='SQLite workspace · '+info.storageKeys+' saved keys · '+info.managedPhotoCount+' managed photos · '+size.toFixed(1)+' MB managed photo storage';\n  }catch(error){setStatus('Local workspace status unavailable: '+(error?.message||error),true)}\n }\n window.jrvsRefreshNativeStatus=refreshNativeStatus;\n setTimeout(refreshNativeStatus,0);\n})();\n</script>";
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

// Ship FlashRaw's ES modules and WebAssembly assets beside the desktop frontend.
// This removes the first-use CDN dependency and keeps RAW decoding available offline.
const flashRawDist = path.join(root, 'node_modules', 'flashraw', 'dist');
await cp(flashRawDist, path.join(output, 'vendor', 'flashraw'), { recursive: true, force: true });
await readFile(path.join(output, 'vendor', 'flashraw', 'browser.js'));
await readFile(path.join(output, 'vendor', 'flashraw', 'flashraw_simd.wasm'));
await readFile(path.join(output, 'vendor', 'flashraw', 'flashraw.wasm'));

console.log('Prepared local-only JRVS desktop frontend, including the bundled FlashRaw decoder, in desktop-dist/.');
