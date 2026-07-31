/**
 * Profile Picture Caching Layer & CDN Optimization Provider
 * Prevents flickering, optimizes lazy loading, and caches image blobs/elements in memory.
 */

// Memory Cache for loaded image URLs to guarantee instant synchronous re-render without flickering
const imageMemoryCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

/**
 * Optimizes CDN URLs (Unsplash, DiceBear, Google, etc.) with responsive sizing & compression formats.
 */
export function optimizeCdnImageUrl(url?: string, size: number = 96): string {
  if (!url) return '';

  try {
    // Unsplash CDN optimization
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', Math.max(120, size * 2).toString());
      urlObj.searchParams.set('h', Math.max(120, size * 2).toString());
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('q', '85');
      return urlObj.toString();
    }

    // DiceBear or SVG Avatar optimization
    if (url.includes('api.dicebear.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('size', Math.max(120, size * 2).toString());
      return urlObj.toString();
    }
  } catch {
    return url;
  }

  return url;
}

/**
 * Checks if an image URL is already warm in the memory cache.
 */
export function isImageCached(url: string): boolean {
  if (!url) return false;
  const optimized = optimizeCdnImageUrl(url);
  return imageMemoryCache.has(optimized);
}

/**
 * Returns the cached URL string if available.
 */
export function getCachedImageUrl(url: string): string | undefined {
  if (!url) return undefined;
  const optimized = optimizeCdnImageUrl(url);
  return imageMemoryCache.get(optimized);
}

/**
 * Preloads an image into the browser's memory cache and returns a Promise resolving to the cached URL.
 */
export function preloadImage(url: string, size: number = 96): Promise<string> {
  if (!url) return Promise.reject(new Error('No URL provided'));
  const optimized = optimizeCdnImageUrl(url, size);

  if (imageMemoryCache.has(optimized)) {
    return Promise.resolve(imageMemoryCache.get(optimized)!);
  }

  if (loadingPromises.has(optimized)) {
    return loadingPromises.get(optimized)!;
  }

  const promise = new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.src = optimized;

    img.onload = () => {
      imageMemoryCache.set(optimized, optimized);
      loadingPromises.delete(optimized);
      resolve(optimized);
    };

    img.onerror = (err) => {
      loadingPromises.delete(optimized);
      reject(err);
    };
  });

  loadingPromises.set(optimized, promise);
  return promise;
}

/**
 * Batch preloads multiple profile picture URLs (useful for lists of chats/contacts).
 */
export function batchPreloadAvatars(urls: (string | undefined)[], size: number = 96): void {
  const validUrls = urls.filter((u): u is string => Boolean(u && (u.startsWith('http') || u.startsWith('data:'))));
  validUrls.forEach((url) => {
    preloadImage(url, size).catch(() => {
      /* ignore background preload error */
    });
  });
}
