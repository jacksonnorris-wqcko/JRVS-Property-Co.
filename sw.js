const CACHE_NAME='jrvs-property-co-v0.41.0';
const CORE=['./','./index.html','./manifest.json','./version.json','./assets/jrvs-app-192.png','./assets/jrvs-app-512.png'];
const RAW_CDN_HOSTS=['esm.sh'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jrvs-property-co-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url),sameOrigin=u.origin===location.origin,rawCdn=RAW_CDN_HOSTS.includes(u.hostname);
 if(!sameOrigin&&!rawCdn)return;
 if(sameOrigin&&u.pathname.endsWith('/version.json')){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}
 e.respondWith(fetch(r).then(res=>{if(res.ok&&(sameOrigin||res.type==='cors')){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,copy));}return res;}).catch(()=>caches.match(r).then(c=>c|| (sameOrigin?caches.match('./index.html'):Promise.reject(new Error('RAW decoder is not cached yet; connect to the internet and retry.'))))));
});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
