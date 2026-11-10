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
  "const APP_VERSION='0.50.0';",
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
html.jrvs-desktop #page-settings .desktop-update-card,
html.jrvs-desktop #page-settings .desktop-install-card { display: none !important; }
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

// Add local database migration, photo import, and portable backup tools.
const desktopDataToolsInjection = "\n<script id=\"jrvs-desktop-data-tools\">\n(function(){\n const invoke=window.__TAURI__?.core?.invoke;\n const status=()=>document.getElementById('jrvsDesktopDataStatus');\n function setStatus(message,error=false){const el=status();if(el){el.textContent=message;el.classList.toggle('error',!!error)}}\n function b64ToBlob(value,type){\n  const binary=atob(value||'');const bytes=new Uint8Array(binary.length);\n  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);\n  return new Blob([bytes],{type:type||'application/octet-stream'});\n }\n function dateStamp(){return new Date().toISOString().slice(0,10)}\n async function downloadPayload(payload,name){\n  const json=JSON.stringify(payload);\n  if(!('CompressionStream' in window))throw new Error('This Windows WebView does not support compressed backups.');\n  const blob=await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).blob();\n  const url=URL.createObjectURL(blob),a=document.createElement('a');\n  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();\n  setTimeout(()=>URL.revokeObjectURL(url),60000);\n  return blob.size;\n }\n async function readPayload(file){\n  const bytes=await file.arrayBuffer();\n  const view=new Uint8Array(bytes);\n  if(view[0]===0x1f&&view[1]===0x8b){\n   if(!('DecompressionStream' in window))throw new Error('Compressed import files require a current version of Windows WebView2.');\n   return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());\n  }\n  return JSON.parse(new TextDecoder().decode(bytes));\n }\n async function createBackupPayload(){\n  const business=JSON.parse(localStorage.getItem('jrvs-data')||'{}');\n  const calendar=JSON.parse(localStorage.getItem('jrvs-calendar')||'[]');\n  const records=await photoRequest('readonly','all');\n  const photos=[];\n  for(let i=0;i<records.length;i++){\n   const photo=records[i];if(!photo?.blob)throw new Error('Photo '+(photo?.name||photo?.id||i+1)+' has no original file. Backup stopped.');\n   const metadata={...photo};delete metadata.blob;delete metadata.previewBlob;\n   for(const key of ['url','previewUrl','objectUrl','previewObjectUrl'])delete metadata[key];\n   photos.push({...metadata,blobBase64:await jrvsPhotoBase64(photo.blob),previewBase64:photo.previewBlob?await jrvsPhotoBase64(photo.previewBlob):null});\n   if((i+1)%10===0)setStatus('Preparing full backup · '+(i+1)+' of '+records.length+' photos…');\n  }\n  return {format:'jrvs-portable-workspace',formatVersion:1,appVersion:'0.50.0',exportedAt:new Date().toISOString(),business,calendar,photos,hasPhotoLibrary:true};\n }\n window.jrvsCreateDesktopBackup=async function(){\n  const button=document.querySelector('.desktop-migration-card button[onclick=\"jrvsCreateDesktopBackup()\"]');\n  if(button){button.disabled=true;button.textContent='Creating…'}\n  try{\n   setStatus('Preparing the database and photo library for backup…');\n   const payload=await createBackupPayload();\n   const size=await downloadPayload(payload,'JRVS-Backup-'+dateStamp()+'.jrvsbackup.gz');\n   setStatus('Backup created · '+(payload.business.jobs?.length||0)+' jobs · '+(payload.business.clients?.length||0)+' clients · '+payload.photos.length+' photos · '+(size/1048576).toFixed(1)+' MB');\n   if(typeof showToast==='function')showToast('Your complete JRVS backup has been created.');\n  }catch(error){console.error(error);setStatus('Backup failed: '+(error?.message||error),true);if(typeof showToast==='function')showToast('JRVS backup failed. '+(error?.message||error),'error')}\n  finally{if(button){button.disabled=false;button.textContent='Create backup'}}\n };\n window.jrvsImportWorkspaceFile=async function(input){\n  const file=input?.files?.[0];if(!file)return;\n  input.disabled=true;\n  try{\n   setStatus('Reading and validating the selected workspace file…');\n   const payload=await readPayload(file);\n   if(!['jrvs-legacy-workspace','jrvs-portable-workspace'].includes(payload?.format)||payload.formatVersion!==1)throw new Error('This is not a supported JRVS migration or backup file.');\n   if(!payload.business||typeof payload.business!=='object'||Array.isArray(payload.business))throw new Error('The file does not contain a valid JRVS business workspace.');\n   if(!Array.isArray(payload.calendar))throw new Error('The file does not contain a valid JRVS calendar.');\n   if(!Array.isArray(payload.photos))throw new Error('The file does not contain a photo-library list.');\n   for(let i=0;i<payload.photos.length;i++){\n    const photo=payload.photos[i];\n    if(!photo||photo.id==null||!photo.blobBase64)throw new Error('Photo '+(i+1)+' is incomplete. Import stopped without replacing the current workspace.');\n   }\n   const summary=[\n    (payload.business.jobs||[]).length+' jobs',(payload.business.clients||[]).length+' clients',\n    (payload.business.quotes||[]).length+' quotes',(payload.business.invoices||[]).length+' invoices',\n    payload.calendar.length+' calendar events',payload.photos.length+' photos'\n   ].join(' · ');\n   const ok=await showConfirm('Import '+summary+'? Your current desktop records will be replaced. JRVS will download a full safety backup first. The original browser data is not changed.',{title:'Import JRVS workspace',confirmText:'Back up and import',danger:false});\n   if(!ok){input.value='';return}\n   setStatus('Creating a safety backup of the current desktop workspace…');\n   const before=await createBackupPayload();\n   await downloadPayload(before,'JRVS-Before-Import-'+dateStamp()+'.jrvsbackup.gz');\n   setStatus('Saving business records into the local SQLite workspace…');\n   await invoke('desktop_import_legacy_workspace',{businessJson:JSON.stringify(payload.business),calendarJson:JSON.stringify(payload.calendar)});\n   const importedIds=new Set();\n   for(let i=0;i<payload.photos.length;i++){\n    const source=payload.photos[i],photo={...source};\n    photo.blob=b64ToBlob(source.blobBase64,source.blobMimeType||source.mimeType||'application/octet-stream');\n    photo.previewBlob=source.previewBase64?b64ToBlob(source.previewBase64,'image/jpeg'):null;\n    delete photo.blobBase64;delete photo.previewBase64;importedIds.add(String(photo.id));\n    setStatus('Copying photo originals into the managed JRVS library · '+(i+1)+' of '+payload.photos.length+'…');\n    await photoRequest('readwrite','put',photo);\n   }\n   if(payload.hasPhotoLibrary){\n    const existing=await photoRequest('readonly','all');\n    for(const photo of existing||[])if(!importedIds.has(String(photo.id)))await photoRequest('readwrite','delete',photo.id);\n   }\n   const storage=window.__JRVS_NATIVE_STORAGE__;\n   if(storage){storage.replace({'jrvs-data':JSON.stringify(payload.business),'jrvs-calendar':JSON.stringify(payload.calendar)});await storage.flush()}\n   await refreshNativeStatus();\n   setStatus('Import complete · '+summary+'. Local database and managed photo copies are ready.');\n   if(typeof showToast==='function')showToast('JRVS workspace imported successfully. Reloading…');\n   input.value='';\n   setTimeout(()=>location.reload(),900);\n  }catch(error){\n   console.error('JRVS workspace import failed',error);\n   setStatus('Import stopped: '+(error?.message||error)+'. Check the safety backup in Downloads before retrying.',true);\n   if(typeof showToast==='function')showToast('JRVS import stopped. '+(error?.message||error),'error');\n   input.value='';\n  }finally{input.disabled=false;refreshNativeStatus()}\n };\n async function refreshNativeStatus(){\n  if(!invoke)return;\n  try{\n   const info=await invoke('desktop_storage_status');\n   const size=(Number(info.managedPhotoBytes)||0)/1048576;\n   const el=status();\n   if(el&&!el.textContent.startsWith('Import')&&!el.textContent.startsWith('Backup'))el.textContent='SQLite workspace · '+info.storageKeys+' saved keys · '+info.managedPhotoCount+' managed photos · '+size.toFixed(1)+' MB managed photo storage';\n  }catch(error){setStatus('Local workspace status unavailable: '+(error?.message||error),true)}\n }\n window.jrvsRefreshNativeStatus=refreshNativeStatus;\n setTimeout(refreshNativeStatus,0);\n})();\n</script>";
const desktopBodyClose = html.lastIndexOf('</body>');
if (desktopBodyClose < 0) {
  throw new Error('Could not find the body closing tag in the desktop frontend.');
}
html = html.slice(0, desktopBodyClose) + desktopDataToolsInjection + html.slice(desktopBodyClose);

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
