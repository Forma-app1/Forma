// نسخة جواد: غيّر الرقم مع كل تحديث
const CACHE="forma-j-v1.0.0";
const SHELL=["./","./index.html","./config.js","./manifest.webmanifest","../app.js","../foods.js","../programs.js","../smart.js","../icon-192.png","../icon-512.png","../apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("forma-j-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  const fonts=url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com";
  if(fonts){e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r})));return}
  if(url.origin!==location.origin)return;
  e.respondWith(fetch(req).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req.mode==="navigate"?"./index.html":req,cp))}return r})
    .catch(()=>caches.match(req.mode==="navigate"?"./index.html":req,{ignoreSearch:true})));
});
