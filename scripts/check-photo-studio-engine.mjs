import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const prepare = await readFile(path.join(root, 'scripts', 'prepare-desktop.mjs'), 'utf8');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

function requireText(source, text, label) {
  assert.ok(source.includes(text), `Missing Photo Studio requirement: ${label}`);
}

const start = html.indexOf('function jrvsRgbToHsl');
const end = html.indexOf('function drawEditorToneCurve', start);
assert.ok(start >= 0 && end > start, 'Could not locate the Photo Studio colour and curve helpers.');
const helpers = html.slice(start, end);
const engine = new Function('editorToneCurve', `${helpers}
return { jrvsRgbToHsl, jrvsHslToRgb, buildEditorToneCurveLut };
`)([64, 128, 192]);

const colourSamples = [
  [255, 0, 0], [255, 128, 0], [255, 255, 0], [0, 255, 0],
  [0, 255, 255], [0, 0, 255], [128, 0, 255], [255, 0, 255],
  [128, 128, 128], [32, 96, 180], [240, 210, 170],
];
for (const rgb of colourSamples) {
  const hsl = engine.jrvsRgbToHsl(...rgb);
  const roundTrip = engine.jrvsHslToRgb(hsl.h, hsl.s, hsl.l);
  roundTrip.forEach((value, index) => {
    assert.ok(Math.abs(value - rgb[index]) <= 1.1, `HSL round-trip drift for ${rgb}: got ${roundTrip}`);
  });
}

const identityCurve = engine.buildEditorToneCurveLut();
assert.equal(identityCurve.length, 256);
for (let i = 0; i < 256; i++) assert.equal(identityCurve[i], i, `Default tone curve must be identity at value ${i}`);

const contrastEngine = new Function('editorToneCurve', `${helpers}
return buildEditorToneCurveLut;
`);
const shapedCurve = contrastEngine([44, 132, 218])();
for (let i = 1; i < 256; i++) {
  assert.ok(shapedCurve[i] >= shapedCurve[i - 1], `Tone curve must remain monotonic at ${i}`);
}
assert.notDeepEqual([...shapedCurve], [...identityCurve], 'Adjusted tone curve should change tonal values.');

requireText(html, "import('./vendor/flashraw/browser.js')", 'local bundled FlashRaw browser entry');
assert.ok(!html.includes('https://esm.sh/flashraw'), 'Runtime RAW decoder must not rely on esm.sh.');
requireText(prepare, "'browser.js'", 'bundled FlashRaw browser module');
requireText(prepare, "'flashraw_simd.wasm'", 'bundled FlashRaw SIMD WASM');
requireText(prepare, "'flashraw.wasm'", 'bundled FlashRaw scalar fallback WASM');
assert.equal(pkg.dependencies?.flashraw, '0.1.0', 'FlashRaw must remain pinned to the validated package version.');

requireText(html, 'schemaVersion:4', 'versioned editor recipe schema');
requireText(html, 'toneCurve:[...editorToneCurve]', 'tone curve persisted in recipes');
requireText(html, 'hsl:JSON.parse(JSON.stringify(editorHsl))', 'HSL settings persisted in recipes');
requireText(html, '![1,2,3,4].includes(recipe.schemaVersion)', 'legacy recipe compatibility');
requireText(html, 'toneCurveLut=buildEditorToneCurveLut()', 'preview and full-resolution renderer use the tone curve');
requireText(html, 'hslActive=EDITOR_HSL_CHANNELS.some', 'renderer applies per-band HSL settings');
requireText(html, "editorRawDeveloped=!!recipe.rawDeveloped", 'RAW development state restored from edit recipes');

console.log('Photo Studio engine checks passed: HSL round-trips, identity/monotonic tone curve, recipe compatibility, renderer integration and bundled RAW runtime.');
