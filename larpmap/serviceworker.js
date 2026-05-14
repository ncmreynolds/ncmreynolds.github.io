//Install and pre-cache

const cacheName = "PWA_cache";
const precachedResources = ["/", "css/map.css", "css/normalise.css", "css/skeleton.css",
	"js/app.js", "js/map.js", "js/tabs.js",
	"images/icons/launchericon-48x48.png", "images/icons/launchericon-72x72.png", "images/icons/launchericon-96x96.png", "images/icons/launchericon-144x144.png", "images/icons/launchericon-1982x192.png", "images/icons/launchericon-512x512.png"
	];

async function precache() {
  const cache = await caches.open(cacheName);
  return cache.addAll(precachedResources);
}

self.addEventListener("install", event => {
	event.waitUntil(precache());
    console.log("Service worker installed", event);
});

//Fetch

function isCacheable(request) {
  const url = new URL(request.url);
  return !url.pathname.endsWith(".json");
}

async function cacheFirstWithRefresh(request) {
  const fetchResponsePromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open("PWA_cache");
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return (await caches.match(request)) || (await fetchResponsePromise);
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open("PWA_cache");
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  if (isCacheable(event.request)) {
    event.respondWith(cacheFirstWithRefresh(event.request));
  }
});

/*
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (precachedResources.includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
  console.log("Service worker fetching...", event)
})
*/