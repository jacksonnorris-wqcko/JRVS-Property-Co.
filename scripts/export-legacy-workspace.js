// JRVS Property Co. — export the existing browser workspace for the Windows desktop app.
// Run this complete script in the browser DevTools Console while the OLD JRVS app is open.
// It only reads the current app data and creates a download. It does not change or delete source data.
(async () => {
  const business = JSON.parse(localStorage.getItem('jrvs-data') || '{}');
  const calendar = JSON.parse(localStorage.getItem('jrvs-calendar') || '[]');
  if (!business || typeof business !== 'object' || Array.isArray(business)) {
    throw new Error('JRVS business data could not be read from this browser profile.');
  }
  if (!Array.isArray(calendar)) throw new Error('JRVS calendar data is not in the expected format.');

  const openPhotoDatabase = () => new Promise((resolve, reject) => {
    const request = indexedDB.open('jrvs-photo-library', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open the JRVS photo library.'));
  });
  const sha256 = async (blob) => {
    if (!crypto?.subtle) throw new Error('SHA-256 integrity checks are unavailable. Please update Chrome or Edge and try again.');
    const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  };
  const sha256Text = async (value) => sha256(new Blob([value], { type: 'application/json' }));
  const blobToBase64 = async (blob) => {
    if (!blob) return null;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  };

  let photos = [];
  const db = await openPhotoDatabase();
  try {
    if (db.objectStoreNames.contains('photos')) {
      photos = await new Promise((resolve, reject) => {
        const tx = db.transaction('photos', 'readonly');
        const request = tx.objectStore('photos').getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error || new Error('Could not read the JRVS photo library.'));
      });
    }
  } finally {
    db.close();
  }

  const photoPayload = [];
  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    if (!photo || photo.id == null || !photo.blob) {
      throw new Error('Photo ' + (index + 1) + ' is missing its original file. Export stopped so nothing is silently skipped.');
    }
    const metadata = { ...photo };
    delete metadata.blob;
    delete metadata.previewBlob;
    for (const key of ['url', 'previewUrl', 'objectUrl', 'previewObjectUrl']) delete metadata[key];
    const originalSha256 = await sha256(photo.blob);
    const previewSha256 = photo.previewBlob ? await sha256(photo.previewBlob) : null;
    photoPayload.push({
      ...metadata,
      blobMimeType: photo.blob.type || photo.mimeType || 'application/octet-stream',
      previewMimeType: photo.previewBlob?.type || null,
      originalByteLength: photo.blob.size,
      previewByteLength: photo.previewBlob?.size || 0,
      originalSha256,
      previewSha256,
      blobBase64: await blobToBase64(photo.blob),
      previewBase64: photo.previewBlob ? await blobToBase64(photo.previewBlob) : null
    });
    if ((index + 1) % 10 === 0) console.info('JRVS export: prepared ' + (index + 1) + ' of ' + photos.length + ' photos…');
  }

  const manifest = {
    hashAlgorithm: 'SHA-256',
    photoCount: photoPayload.length,
    businessSha256: await sha256Text(JSON.stringify(business)),
    calendarSha256: await sha256Text(JSON.stringify(calendar)),
    originalPhotoBytes: photoPayload.reduce((sum, photo) => sum + (photo.originalByteLength || 0), 0),
    previewPhotoBytes: photoPayload.reduce((sum, photo) => sum + (photo.previewByteLength || 0), 0)
  };
  const payload = {
    format: 'jrvs-legacy-workspace',
    formatVersion: 2,
    exportedAt: new Date().toISOString(),
    source: 'JRVS Property Co. browser app',
    business,
    calendar,
    photos: photoPayload,
    hasPhotoLibrary: true,
    manifest
  };
  const json = JSON.stringify(payload);
  if (!('CompressionStream' in window)) {
    throw new Error('This browser does not support compressed export. Please use the latest Chrome or Edge.');
  }
  const compressed = await new Response(
    new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))
  ).blob();
  const filename = 'JRVS-Legacy-Migration-' + new Date().toISOString().slice(0, 10) + '.jrvslegacy.gz';
  const url = URL.createObjectURL(compressed);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  console.info('JRVS export finished:', {
    jobs: business.jobs?.length || 0,
    clients: business.clients?.length || 0,
    quotes: business.quotes?.length || 0,
    invoices: business.invoices?.length || 0,
    calendarEvents: calendar.length,
    photos: photoPayload.length,
    compressedBytes: compressed.size,
    file: filename
  });
  console.info('Your original browser records and photos were left unchanged.');
})().catch(error => {
  console.error('JRVS export stopped:', error);
  alert('JRVS export stopped: ' + (error?.message || error));
});
