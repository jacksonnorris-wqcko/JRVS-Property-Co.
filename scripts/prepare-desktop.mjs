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
html = replaceExactlyOnce(html, '<section class="settings-card cloud-control-card">', '<section class="settings-card cloud-control-card desktop-cloud-card">', 'cloud settings card');
html = replaceExactlyOnce(
  html,
  '<section class="settings-card"><div class="settings-card-head"><span class="settings-icon">↻</span><div><h3>App updates</h3>',
  '<section class="settings-card desktop-update-card"><div class="settings-card-head"><span class="settings-icon">↻</span><div><h3>App updates</h3>',
  'browser update settings card'
);
html = replaceExactlyOnce(
  html,
  '<section class="settings-card"><div class="settings-card-head"><span class="settings-icon">▣</span><div><h3>Install JRVS</h3>',
  '<section class="settings-card desktop-install-card"><div class="settings-card-head"><span class="settings-icon">▣</span><div><h3>Install JRVS</h3>',
  'PWA install settings card'
);

html = replaceExactlyOnce(html, 'Manage your JRVS account, device setup and app updates.', 'Manage your local workspace, storage and backups.', 'desktop settings description');
html = replaceExactlyOnce(html, 'Records are stored locally and can sync to your private JRVS cloud account.', 'Records are stored on this PC in your local JRVS workspace.', 'local storage description');
html = replaceExactlyOnce(html, '<span class="pill">Local + Cloud</span>', '<span class="pill">Local only</span>', 'local-only storage label');
html = replaceExactlyOnce(
  html,
  'Automatic app updates do not replace or delete saved records. Keep your cloud account credentials secure. Avoid clearing browser data, as this can remove local records and photos that have not been synchronised.',
  'Your business records and photo library stay on this PC. Use JRVS backups to protect or transfer your workspace.',
  'desktop data privacy note'
);
html = replaceExactlyOnce(
  html,
  'Permanently removes jobs, clients, quotes, invoices, financial records, calendar entries and all stored photos. When signed in, your JRVS cloud workspace is cleared too. Your login, app and settings remain.',
  'Permanently removes local jobs, clients, quotes, invoices, financial records, calendar entries and all stored photos. Your Windows app installation remains.',
  'desktop reset warning'
);

// Mark the generated entry as desktop-only and suppress legacy browser controls.
const desktopHeadInjection = `<style>
html.jrvs-desktop #page-settings .desktop-cloud-card,
html.jrvs-desktop #page-settings .desktop-update-card,
html.jrvs-desktop #page-settings .desktop-install-card { display: none !important; }
</style>
<script>window.__JRVS_DESKTOP__ = true; document.documentElement.classList.add('jrvs-desktop');</script>
`;
const headCloseIndex = html.indexOf('</head>');
if (headCloseIndex < 0) {
  throw new Error('Could not find the document head. Desktop build stopped.');
}
html = html.slice(0, headCloseIndex) + desktopHeadInjection + html.slice(headCloseIndex);

// This is a development-shell refresh only. Tauri's signed updater is a later
// release stage and must not be confused with the old browser service worker.
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

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(path.join(root, 'jrvs-logo.png'), path.join(output, 'jrvs-logo.png'));
await writeFile(path.join(output, 'index.html'), html, 'utf8');

console.log('Prepared local-only JRVS desktop frontend in desktop-dist/.');
