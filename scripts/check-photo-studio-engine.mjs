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
function extract(source, startToken, endToken, label) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start + startToken.length);
  assert.ok(start >= 0 && end > start, `Could not locate ${label} helper block.`);
  return source.slice(start, end);
}

const colourHelpers = extract(html, 'function jrvsRgbToHsl', 'function drawEditorToneCurve', 'HSL and tone curve');
const channels = [
  {id:'red',center:0},{id:'orange',center:30},{id:'yellow',center:60},{id:'green',center:120},
  {id:'aqua',center:180},{id:'blue',center:220},{id:'purple',center:270},{id:'magenta',center:315},
];
const neutralHsl = Object.fromEntries(channels.map(channel => [channel.id, {hue:0,saturation:0,luminance:0}]));
const colourFactory = new Function('editorToneCurve', 'EDITOR_HSL_CHANNELS', 'editorHsl', `${colourHelpers}
return { jrvsRgbToHsl, jrvsHslToRgb, buildEditorToneCurveLut, buildEditorHslAdjustmentLut };
`);
const colourEngine = colourFactory([64,128,192], channels, neutralHsl);

const colourSamples = [
  [255,0,0],[255,128,0],[255,255,0],[0,255,0],[0,255,255],
  [0,0,255],[128,0,255],[255,0,255],[128,128,128],[32,96,180],[240,210,170],
];
for (const rgb of colourSamples) {
  const hsl = colourEngine.jrvsRgbToHsl(...rgb);
  const roundTrip = colourEngine.jrvsHslToRgb(hsl.h,hsl.s,hsl.l);
  roundTrip.forEach((value,index) => assert.ok(Math.abs(value-rgb[index])<=1.1,`HSL round-trip drift for ${rgb}: got ${roundTrip}`));
}
const identityCurve = colourEngine.buildEditorToneCurveLut();
assert.equal(identityCurve.length,256);
for(let i=0;i<256;i++)assert.equal(identityCurve[i],i,`Default tone curve must be identity at ${i}`);
const shapedCurve = colourFactory([44,132,218],channels,neutralHsl).buildEditorToneCurveLut();
for(let i=1;i<256;i++)assert.ok(shapedCurve[i]>=shapedCurve[i-1],`Tone curve must remain monotonic at ${i}`);
assert.notDeepEqual([...shapedCurve],[...identityCurve]);
const orangeSettings = Object.fromEntries(channels.map(channel=>[channel.id,{hue:0,saturation:0,luminance:0}]));
orangeSettings.orange={hue:20,saturation:50,luminance:20};
const orangeLut=colourFactory([64,128,192],channels,orangeSettings).buildEditorHslAdjustmentLut();
assert.equal(orangeLut[30].hue,6);
assert.equal(orangeLut[30].saturation,.5);
assert.equal(orangeLut[120].hue,0);

// Geometry math: identity, forward corner mapping and inverse round trips.
const geometryHelpers=extract(html,'function editorBuildGeometryQuad','function buildEditorLocalMaskCanvas','projective geometry and mask falloff');
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const geometry=new Function('editorClamp',`${geometryHelpers}
return {editorBuildGeometryQuad,editorBuildHomography,editorInvertHomography,editorApplyHomography,editorProjectiveMap,editorProjectiveInverseMap,editorMapGeometryPoint,editorMaskFalloff};
`)(clamp);
const identityQuad=geometry.editorBuildGeometryQuad(0,0);
const identityMatrix=geometry.editorBuildHomography(identityQuad);
const identityInverse=geometry.editorInvertHomography(identityMatrix);
for(const [x,y] of [[0,0],[1,0],[1,1],[0,1],[.1,.1],[.5,.5],[.83,.22]]){
 const point=geometry.editorApplyHomography(identityMatrix,x,y);
 assert.ok(Math.abs(point.x-x)<1e-9 && Math.abs(point.y-y)<1e-9,`Neutral geometry changed point ${x},${y}`);
 const roundTrip=geometry.editorApplyHomography(identityInverse,point.x,point.y);
 assert.ok(Math.abs(roundTrip.x-x)<1e-9 && Math.abs(roundTrip.y-y)<1e-9);
}
const transformedQuad=geometry.editorBuildGeometryQuad(10,-7);
const transformedMatrix=geometry.editorBuildHomography(transformedQuad);
const inverse=geometry.editorInvertHomography(transformedMatrix);
transformedQuad.forEach((corner,index)=>{
 const input=[[0,0],[1,0],[1,1],[0,1]][index];
 const mapped=geometry.editorApplyHomography(transformedMatrix,...input);
 assert.ok(Math.abs(mapped.x-corner.x)<1e-9 && Math.abs(mapped.y-corner.y)<1e-9,`Homography misses corner ${index}`);
 const back=geometry.editorApplyHomography(inverse,mapped.x,mapped.y);
 assert.ok(Math.abs(back.x-input[0])<1e-9 && Math.abs(back.y-input[1])<1e-9);
});
const neutralLens=geometry.editorMapGeometryPoint(.25,.75,0,0,0);
assert.ok(Math.abs(neutralLens.x-.25)<1e-9 && Math.abs(neutralLens.y-.75)<1e-9);
assert.equal(geometry.editorMaskFalloff(0,10,.5),1);
assert.equal(geometry.editorMaskFalloff(5,10,.5),1);
assert.ok(Math.abs(geometry.editorMaskFalloff(7.5,10,.5)-.5)<1e-9);
assert.equal(geometry.editorMaskFalloff(10,10,.5),0);
assert.equal(geometry.editorMaskFalloff(5,10,0),1);

// Clone and Heal must produce different blends for different source/destination colour fields.
const retouchHelpers=extract(html,'function editorRetouchBlendPixel','function applyEditorRetouchStrokes','clone/heal blending');
const retouch=new Function('editorClamp',`${retouchHelpers}
return editorRetouchBlendPixel;
`)(clamp);
const source=[100,110,120],destination=[160,170,180],sourceMean=[90,100,110],destinationMean=[110,120,130];
const clone=retouch('clone',source,destination,sourceMean,destinationMean,1);
const heal=retouch('heal',source,destination,sourceMean,destinationMean,1);
assert.deepEqual(clone,source);
assert.deepEqual(heal,[120,130,140]);
assert.notDeepEqual(clone,heal);
assert.deepEqual(retouch('heal',source,destination,sourceMean,destinationMean,0),destination);

// Packaging, recipes, renderer and workflow integration.
requireText(html,"import('./vendor/flashraw/browser.js')",'local bundled FlashRaw browser entry');
assert.ok(!html.includes('https://esm.sh/flashraw'),'RAW decoder must not use a runtime CDN');
for(const file of ["'browser.js'","'flashraw_simd.wasm'","'flashraw.wasm'","'LICENSE-MIT'","'LICENSE-APACHE'"])requireText(prepare,file,`desktop bundle includes ${file}`);
assert.equal(pkg.dependencies?.flashraw,'0.1.0');

requireText(html,'schemaVersion:5','current recipe schema');
requireText(html,'![1,2,3,4,5].includes(recipe.schemaVersion)','legacy recipe versions remain supported');
requireText(html,'localMasks:cloneEditorLocalMasks()','masks persist in the non-destructive recipe');
requireText(html,'normaliseEditorLocalMasks(recipe.localMasks)','masks restore from recipe');
requireText(html,'toneCurve:[...editorToneCurve]','tone curve persists');
requireText(html,'hsl:JSON.parse(JSON.stringify(editorHsl))','HSL persists');
requireText(html,'editorApplyGeometryWarp(temp,canvas,pv,ph,distortion)','geometry is shared by preview and full export');
requireText(html,'applyEditorLocalMasks(ctx,width,height)','local masks are in the shared renderer');
requireText(html,'applyEditorRetouchStrokes(ctx,width,height,retouchGroups)','retouch is in the shared renderer');
requireText(html,'editorRetouchActive?[...editorRetouchStrokes,editorRetouchActive]:editorRetouchStrokes','live Clone/Heal stroke preview is included in the render');
requireText(html,'drawEditorMaskOverlay(ctx)','mask overlay is a preview-only visual aid');
requireText(html,'localMaskSelectedId:editorLocalMaskSelectedId','undo/redo records mask selection');
requireText(html,'editorLocalMasks=normaliseEditorLocalMasks(s.localMasks)','undo/redo restores mask state');
requireText(html,'localMasks:cloneEditorLocalMasks(),localMaskSelectedId:editorLocalMaskSelectedId','exact look batch retains mask state');
requireText(html,'editorLocalMasks=[];editorLocalMaskSelectedId=null;editorLocalMaskActive=null','batch preset/Smart Finish isolates photo masks');
requireText(html,'rawDeveloped:!!editorRawDeveloped','RAW development state remains saved');
requireText(html,'![1,2,3,4,5].includes(recipe.schemaVersion)','older saved edit recipes remain loadable');

console.log('Photo Studio regression checks passed: colour/HSL, tone curve, projective geometry, neutral lens, mask feathering, separate clone/heal blends, v5 recipes and workflow integration.');
