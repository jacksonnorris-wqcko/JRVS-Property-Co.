const CACHE_NAME='jrvs-property-co-v0.0.9.1';
const CORE=['./','./index.html','./manifest.json','./version.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jrvs-property-co-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;if(new URL(r.url).pathname.endsWith('/version.json')){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}e.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));}return res;}).catch(()=>caches.match(r).then(c=>c||caches.match('./index.html'))));});
