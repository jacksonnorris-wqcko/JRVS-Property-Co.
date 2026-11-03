const CACHE_NAME='jrvs-property-co-v0.0.2';
const CORE=['./','./index.html','./manifest.json','./version.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jrvs-property-co-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;if(new URL(req.url).pathname.endsWith('/version.json')){event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match(req)));return;}event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html'))));});
