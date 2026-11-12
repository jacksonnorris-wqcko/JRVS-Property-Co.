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
return {editorBuildGeometryQuad,editorBuildHomography,editorInvertHomography,editorApplyHomography,editorProjectiveMap,editorProjectiveInverseMap,editorMapGeometryPoint,editorMaskFalloff,editorGradientMaskAlpha};
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
for (const strength of [-100,100]) {
  for (const [x,y] of [[0,0],[1,.5],[.5,1],[1,1],[.2,.75]]) {
    const mapped=geometry.editorMapGeometryPoint(x,y,0,0,strength);
    assert.ok(Number.isFinite(mapped.x)&&Number.isFinite(mapped.y)&&mapped.x>=0&&mapped.x<=1&&mapped.y>=0&&mapped.y<=1,
      `Lens correction sampled outside the image at ${x},${y}, strength ${strength}`);
  }
}
assert.equal(geometry.editorMaskFalloff(0,10,.5),1);
assert.equal(geometry.editorMaskFalloff(5,10,.5),1);
assert.ok(Math.abs(geometry.editorMaskFalloff(7.5,10,.5)-.5)<1e-9);
assert.equal(geometry.editorMaskFalloff(10,10,.5),0);
assert.equal(geometry.editorMaskFalloff(5,10,0),1);
// Gradient mask geometry: directional fade and elliptical radial falloff.
const linearMask={type:'linear',gradientFeather:.25,geometry:{x1:.1,y1:.5,x2:.9,y2:.5}};
assert.equal(geometry.editorGradientMaskAlpha(linearMask,.1,.5),1);
assert.equal(geometry.editorGradientMaskAlpha(linearMask,.7,.5),1);
assert.ok(Math.abs(geometry.editorGradientMaskAlpha(linearMask,.8,.5)-.5)<1e-9);
assert.equal(geometry.editorGradientMaskAlpha(linearMask,.9,.5),0);
assert.equal(geometry.editorGradientMaskAlpha(linearMask,.95,.1),0);
const radialMask={type:'radial',gradientFeather:.5,geometry:{cx:.5,cy:.5,rx:.25,ry:.5}};
assert.equal(geometry.editorGradientMaskAlpha(radialMask,.5,.5),1);
assert.equal(geometry.editorGradientMaskAlpha(radialMask,.375,.5),1);
assert.ok(Math.abs(geometry.editorGradientMaskAlpha(radialMask,.3125,.5)-.5)<1e-9);
assert.equal(geometry.editorGradientMaskAlpha(radialMask,.25,.5),0);
assert.equal(geometry.editorGradientMaskAlpha({...radialMask,geometry:null},.5,.5),0);
const maskGeometrySource=extract(html,'function editorMaskGeometryFromDrag','function editorLocalMaskPointerDown','gradient drag geometry');
const maskGeometryEngine=new Function('editorClamp',maskGeometrySource+'\nreturn editorMaskGeometryFromDrag;\n')(clamp);
assert.deepEqual(maskGeometryEngine('linear',{x:.1,y:.2},{x:.9,y:.7}),{x1:.1,y1:.2,x2:.9,y2:.7});
const radialDrag=maskGeometryEngine('radial',{x:.5,y:.5},{x:.7,y:.8});
assert.ok(Math.abs(radialDrag.cx-.5)<1e-9&&Math.abs(radialDrag.cy-.5)<1e-9&&Math.abs(radialDrag.rx-.2)<1e-9&&Math.abs(radialDrag.ry-.3)<1e-9);
assert.equal(maskGeometryEngine('linear',{x:.5,y:.5},{x:.501,y:.501}),null);

// Mask recipes are bounded on restore and clamp unsupported values safely.
const normaliseMaskSource=extract(html,'function normaliseEditorLocalMasks','function cloneEditorLocalMasks','mask recipe normalisation');
const normaliseMasks=new Function('editorClamp','jrvsNewId',`${normaliseMaskSource}
return normaliseEditorLocalMasks;
`)(clamp, prefix => prefix+'-test');
const overLimitMask=normaliseMasks([{
  id:'mask-test',name:'Test mask',exposure:20,highlights:-150,shadows:25,
  strokes:Array.from({length:501},(_,index)=>({mode:index===0?'erase':'paint',opacity:2,feather:2,
    dabs:Array.from({length:index===0?12001:1},()=>({x:1.5,y:-.5,radius:1}))}))
}])[0];
assert.equal(overLimitMask.exposure,2);
assert.equal(overLimitMask.highlights,-100);
assert.equal(overLimitMask.strokes.length,500);
assert.equal(overLimitMask.strokes[0].mode,'erase');
assert.equal(overLimitMask.strokes[0].dabs.length,12000);
assert.equal(overLimitMask.strokes[0].dabs[0].x,1);
assert.equal(overLimitMask.strokes[0].dabs[0].y,0);
assert.equal(overLimitMask.strokes[0].dabs[0].radius,.45);
const gradientNormalised=normaliseMasks([{type:'radial',geometry:{cx:.5,cy:.4,rx:.9,ry:.2},gradientFeather:0,contrast:140,whites:-120,blacks:30}])[0];
assert.equal(gradientNormalised.type,'radial');
assert.deepEqual(gradientNormalised.geometry,{cx:.5,cy:.4,rx:.75,ry:.2});
assert.equal(gradientNormalised.gradientFeather,.05);
assert.equal(gradientNormalised.contrast,100);
assert.equal(gradientNormalised.whites,-100);
assert.equal(gradientNormalised.blacks,30);

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
const rawDecodeAdapter=extract(html,'async function decodeRawToJpeg','async function extractEmbeddedRawJpeg','FlashRaw RAW decode adapter');
requireText(rawDecodeAdapter,"demosaic:halfSize?'half-size':'auto'","FlashRaw 0.2 uses half-size previews and sensor-aware auto full-resolution demosaicing");
assert.ok(/demosaic:halfSize\?'half-size':'auto'/.test(rawDecodeAdapter),"Full-resolution RAW development must retain sensor-aware auto demosaicing");

requireText(html,"import('./vendor/flashraw/browser.js')",'local bundled FlashRaw browser entry');
assert.ok(!html.includes('https://esm.sh/flashraw'),'RAW decoder must not use a runtime CDN');
for(const file of ["'browser.js'","'flashraw_simd.wasm'","'flashraw.wasm'","'LICENSE-MIT'","'LICENSE-APACHE'"])requireText(prepare,file,`desktop bundle includes ${file}`);
assert.equal(pkg.dependencies?.flashraw,'0.2.0');

// Linear RAW source conversion: IEEE-754 half-float values and all EXIF orientations.
const rawMathSource=extract(html,'function editorHalfToFloat','function editorLinearToSrgb','linear RAW math helpers');
const rawMath=new Function(rawMathSource+'\nreturn {editorHalfToFloat,editorRawOrientedSize,editorRawSensorPointFromOriented};\n')();
for(const [bits,expected] of [[0x0000,0],[0x3c00,1],[0x3800,.5],[0x4000,2],[0xbc00,-1]])assert.ok(Math.abs(rawMath.editorHalfToFloat(bits)-expected)<1e-8);
for(let orientation=1;orientation<=8;orientation++){
 const size=rawMath.editorRawOrientedSize(3,2,orientation),seen=new Set();
 for(let y=0;y<size.height;y++)for(let x=0;x<size.width;x++){
  const p=rawMath.editorRawSensorPointFromOriented(x,y,3,2,orientation);
  assert.ok(p.x>=0&&p.x<3&&p.y>=0&&p.y<2,`Orientation ${orientation} maps outside the RAW frame`);
  seen.add(p.x+','+p.y);
 }
 assert.equal(seen.size,6,`Orientation ${orientation} must map every sensor pixel exactly once`);
}
requireText(html,"output:'linear-rgb',sampleType:'f16',demosaic:'auto'",'FlashRaw high-precision linear RAW decode');
requireText(html,'editorRawLinearFrame=developed','the original decoded linear frame is retained during editing');
requireText(html,'editorLinearRawToCanvas(rawFrame,maxDimension','preview and export render from the retained linear source');
requireText(html,'let editorRawCanvasCache=new WeakMap()','linear RAW display previews are cached per immutable frame');
requireText(html,'let editorLinearSrgbLut=null','linear-to-sRGB transfer is table driven rather than recomputed per pixel');
requireText(html,'const mappedLum=lum<=.78?lum:.78+.22*(lum-.78)/(lum-.78+.22)','RAW highlight output uses a smooth luminance shoulder');

requireText(html,'exposure=rawFrame?1:Math.pow(2,v.exposure)','RAW exposure is applied before sRGB encoding and is not doubled');

console.log('Linear RAW regression checks passed: half-float decoding, EXIF orientation transforms, sensor-linear decoder wiring and retained-source rendering.');

assert.equal(pkg.dependencies?.flashraw,'0.2.0');

requireText(html,'schemaVersion:5','current recipe schema');
requireText(html,'![1,2,3,4,5].includes(recipe.schemaVersion)','legacy recipe versions remain supported');
requireText(html,'localMasks:cloneEditorLocalMasks()','masks persist in the non-destructive recipe');
requireText(html,'normaliseEditorLocalMasks(recipe.localMasks)','masks restore from recipe');
requireText(html,'mask.strokes.length>=500','mask stroke limit is enforced during painting');
requireText(html,'stroke.dabs.length<12000','mask dab limit is enforced during painting');
requireText(html,'toneCurve:[...editorToneCurve]','tone curve persists');
requireText(html,'hsl:JSON.parse(JSON.stringify(editorHsl))','HSL persists');
requireText(html,'editorApplyGeometryWarp(temp,canvas,pv,ph,distortion)','geometry is shared by preview and full export');
requireText(html,'editorApplyHomography(homography,warpedU,warpedV)','render maps output pixels through the precomputed destination-to-source homography');
requireText(html,'maxRadialFactor=k>0?1+k*.5:1','manual lens distortion avoids sampling beyond the image bounds');
requireText(html,'const finalPixels=ctx.getImageData(0,0,width,height).data','histogram is calculated from the final composite');
requireText(html,'applyEditorLocalMasks(ctx,width,height)','local masks are in the shared renderer');
requireText(html,'createLinearGradient(x1,y1,x2,y2)','linear gradient masks render in the local mask canvas');
requireText(html,'createRadialGradient(0,0,0,0,0,1)','radial gradient masks render as editable ellipses');
requireText(html,'mask.type===\'linear\'&&geometry','linear gradient geometry is composed in the mask renderer');
requireText(html,'mask.type===\'radial\'&&geometry','radial gradient geometry is composed in the mask renderer');
requireText(html,'localMaskContrast','local contrast adjustment control exists');
requireText(html,'localMaskWhites','local whites adjustment control exists');
requireText(html,'localMaskBlacks','local blacks adjustment control exists');
requireText(html,'drawEditorMaskGuides(ctx)','gradient drag guides are composed after the mask overlay');
requireText(html,'applyEditorRetouchStrokes(ctx,width,height,retouchGroups)','retouch is in the shared renderer');
requireText(html,'editorRetouchActive?[...editorRetouchStrokes,editorRetouchActive]:editorRetouchStrokes','live Clone/Heal stroke preview is included in the render');
requireText(html,'drawEditorMaskOverlay(ctx)','mask overlay is a preview-only visual aid');
requireText(html,'localMaskSelectedId:editorLocalMaskSelectedId','undo/redo records mask selection');
requireText(html,'editorLocalMasks=normaliseEditorLocalMasks(s.localMasks)','undo/redo restores mask state');
requireText(html,'localMasks:cloneEditorLocalMasks(),localMaskSelectedId:editorLocalMaskSelectedId','exact look batch retains mask state');
requireText(html,'editorLocalMasks=[];editorLocalMaskSelectedId=null;editorLocalMaskActive=null','batch preset/Smart Finish isolates photo masks');
requireText(html,'rawDeveloped:!!editorRawDeveloped','RAW development state remains saved');
requireText(html,'![1,2,3,4,5].includes(recipe.schemaVersion)','older saved edit recipes remain loadable');

console.log('Photo Studio regression checks passed: colour/HSL, tone curve, projective geometry, bounded lens warp, brush/linear/radial masks, local tonal controls, recipe compatibility, separate clone/heal blends and workflow integration.');
