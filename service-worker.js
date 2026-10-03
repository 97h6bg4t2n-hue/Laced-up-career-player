const CACHE='career-story-first-build-v1';
const CORE=[
  './','./index.html','./manifest.webmanifest',
  './css/main.css','./css/creator.css','./css/player-model.css','./css/game.css',
  './data/countries.js','./data/clubs.js','./data/names.js',
  './js/utils.js','./js/save-system.js','./js/player-model.js','./js/career.js','./js/match-engine.js','./js/ui.js','./js/router.js','./js/app.js',
  './assets/icons/icon-180.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))));
});
