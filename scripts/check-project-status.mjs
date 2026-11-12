import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');

const [packageText, cargoText, tauriText, status, prompt, continuity, prepare, source] = await Promise.all([
  read('package.json'),
  read('src-tauri/Cargo.toml'),
  read('src-tauri/tauri.conf.json'),
  read('PROJECT_STATUS.md'),
  read('NEW_CHAT_PROMPT.md'),
  read('docs/CHATGPT_CONTINUITY.md'),
  read('scripts/prepare-desktop.mjs'),
  read('index.html')
]);

const packageJson = JSON.parse(packageText);
const tauri = JSON.parse(tauriText);
const cargoVersion = cargoText.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const desktopVersion = String(packageJson.version || '').trim();

if (!desktopVersion) throw new Error('package.json is missing the desktop version.');
if (tauri.version !== desktopVersion) {
  throw new Error(`Version mismatch: package.json is ${desktopVersion}, tauri.conf.json is ${tauri.version}.`);
}
if (cargoVersion !== desktopVersion) {
  throw new Error(`Version mismatch: package.json is ${desktopVersion}, Cargo.toml is ${cargoVersion || 'missing'}.`);
}

const requiredStatus = [
  `**Active desktop branch:** \`desktop-transition\``,
  `**Current desktop version:** \`${desktopVersion}\``,
  '## Current active work and next action',
  '## Permanent working agreements'
];
for (const text of requiredStatus) {
  if (!status.includes(text)) {
    throw new Error(`PROJECT_STATUS.md is missing or out of date: ${text}`);
  }
}

if (!prompt.includes('PROJECT_STATUS.md') || !prompt.includes('desktop-transition')) {
  throw new Error('NEW_CHAT_PROMPT.md is missing its repository/branch continuation instructions.');
}
if (!continuity.includes('Before substantial work') || !continuity.includes('checkpoint')) {
  throw new Error('docs/CHATGPT_CONTINUITY.md is missing the checkpoint protocol.');
}
if (!prepare.includes('desktopPackage.version') || !prepare.includes('${desktopVersion}')) {
  throw new Error('Desktop preparation must inject its visible app version from package.json.');
}

if (!prepare.includes("appVersion:'${desktopVersion}'")) {
  throw new Error(`Desktop backup payload version must match ${desktopVersion}.`);
}
const releaseNotes = await read(`RELEASE_NOTES_V${desktopVersion}.md`);
if (!releaseNotes.includes(`V${desktopVersion} Release Notes`)) {
  throw new Error(`Release notes for desktop version ${desktopVersion} are missing or stale.`);
}
if (!source.includes("const APP_VERSION='0.48.0';")) {
  throw new Error('The expected stable PWA source-version anchor is missing; review desktop version injection before changing the build.');
}

console.log(`JRVS handover check passed: desktop-transition, version ${desktopVersion}, project status and new-chat instructions are present.`);

const documentPrintStart = source.indexOf('function printBusinessDocument(type,id){');
const documentPrintEnd = source.indexOf('\nfunction convertQuoteToJob', documentPrintStart);
if (documentPrintStart < 0 || documentPrintEnd < 0) throw new Error('Quote/invoice document preview function is missing.');
const documentPrintSource = source.slice(documentPrintStart, documentPrintEnd);
if (/window\.open\s*\(/.test(documentPrintSource) || documentPrintSource.includes('Please allow pop-ups')) {
  throw new Error('Quote/invoice PDF generation must not depend on browser pop-ups.');
}
if (!source.includes('id="businessDocumentPreviewFrame"') || !source.includes('function printBusinessDocumentPreview()') || !source.includes('frame.srcdoc=html;') || !source.includes('frame.contentWindow.print()')) {
  throw new Error('In-app quote/invoice print preview is incomplete.');
}

const editorTabs = ['basic','colour','detail','geometry','mask','retouch','export'];
for (const tab of editorTabs) {
  if (!source.includes('data-editor-tab="' + tab + '"') || !source.includes('data-editor-group="' + tab + '"')) {
    throw new Error('Photo Studio 2.0 is missing its ' + tab + ' workspace.');
  }
}
if (!source.includes('class="editor-tool-rail"') || !source.includes('id="editorPanelTitle"') || !source.includes('class="editor-canvas-toolstrip"') || !source.includes('id="editorFilmstripWrap"')) {
  throw new Error('Photo Studio 2.0 workstation layout is incomplete.');
}
for (const action of ["activateEditorMaskTool()", "activateEditorRetouchTool('clone')", "activateEditorRetouchTool('heal')"]) {
  if (!source.includes(action)) throw new Error('Photo Studio direct canvas action is missing: ' + action);
}
for (const preset of ['natural','bright','window','modern']) {
  if (!source.includes('data-editor-preset="' + preset + '"')) throw new Error('Photo Studio quick look is missing: ' + preset);
}
