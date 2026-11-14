// غيّر الرقم مع كل تحديث
const CACHE="forma-v4.4.0";
const SHELL=["./","./index.html","./app.js","./gate.js","./foods.js","./programs.js","./smart.js","./plus.css","./manifest.webmanifest","./lib/platform.js","./lib/cloud.js","./lib/coach.js","./brand/icon-192.png","./brand/icon-512.png","./brand/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("forma-v")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  const fonts=url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com"||url.hostname==="cdn.jsdelivr.net";
  if(fonts){e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r})));return}
  if(url.origin!==location.origin)return;
  if(url.pathname.includes("/jawad/"))return;
  // ملفات التطبيق: من النت أول عشان التحديثات توصل فورا، والكاش لما ما فيه نت
  // no-cache: يتأكد من السيرفر كل مرة، عشان التحديث يوصل على طول بدل ما يستنى 10 دقايق
  e.respondWith(fetch(req.url,{cache:"no-cache",credentials:"same-origin"}).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req.mode==="navigate"?"./index.html":req,cp))}return r})
    .catch(()=>caches.match(req.mode==="navigate"?"./index.html":req,{ignoreSearch:true})));
});
