// 아주 단순한 오프라인 캐시. 지도 타일/외부 API는 캐시하지 않고
// 앱 자체 파일(껍데기)만 캐시해서, 네트워크가 잠깐 끊겨도 앱은 열리도록 합니다.
const CACHE_NAME = "insect-map-cache-v1";
const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  // 카카오맵 API, 타일 서버 등 외부 요청은 그대로 네트워크로 보냄
  if (url.includes("dapi.kakao.com") || url.includes("daumcdn.net") || url.includes("kakaocdn")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
