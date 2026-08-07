// Utility to pre-cache all static icons and initial assets into Cache API and memory

const STATIC_ASSETS = [
  '/favicon.png',
  '/great-minds-logo.svg',
  '/images/nexa_app_logo.jpg',
  '/images/app_ai_icon.jpg',
  '/images/greatminds_ai_icon.jpg',
  '/images/greatminds_chat_bg.jpg'
];

export async function preCacheAppAssets() {
  // 1. In-memory pre-loading via Image constructor for instant rendering
  STATIC_ASSETS.forEach((url) => {
    const img = new Image();
    img.src = url;
  });

  // 2. Browser Cache API pre-fetching
  if ('caches' in window) {
    try {
      const cache = await caches.open('nexa-app-assets');
      await Promise.allSettled(
        STATIC_ASSETS.map(async (url) => {
          const match = await cache.match(url);
          if (!match) {
            await cache.add(url);
          }
        })
      );
    } catch (e) {
      console.warn('[AssetPreloader] Cache API error:', e);
    }
  }

  // 3. Register Service Worker if supported
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed: ', err);
      });
    });
  }
}
