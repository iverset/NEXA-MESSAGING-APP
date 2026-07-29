import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  isImageCached,
  getCachedImageUrl,
  preloadImage,
  optimizeCdnImageUrl,
} from '../services/ImageCacheService';

interface CachedAvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  alt?: string;
  showOnlineBadge?: boolean;
  isOnline?: boolean;
  lazy?: boolean;
}

/**
 * Computes initials memoized from a full name.
 */
function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates a deterministic color gradient based on the name string.
 */
function getInitialsBgGradient(name?: string): string {
  if (!name) return 'linear-gradient(135deg, #00A884 0%, #075E54 100%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    'linear-gradient(135deg, #00A884 0%, #075E54 100%)', // WhatsApp Green
    'linear-gradient(135deg, #3A7BD5 0%, #3A6073 100%)', // Ocean Blue
    'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)', // Coral Dusk
    'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', // Deep Purple
    'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)', // Sunset Gold
    'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)', // Emerald Teal
    'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', // Berry Violet
  ];
  return gradients[Math.abs(hash) % gradients.length];
}

export const CachedAvatar: React.FC<CachedAvatarProps> = React.memo(({
  src,
  name,
  size = 48,
  className = '',
  style = {},
  onClick,
  alt,
  showOnlineBadge = false,
  isOnline = false,
  lazy = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute optimized URL
  const optimizedUrl = useMemo(() => {
    if (!src || (!src.startsWith('http') && !src.startsWith('data:'))) {
      return null;
    }
    return optimizeCdnImageUrl(src, size);
  }, [src, size]);

  // Synchronous initial state check to prevent flash of unstyled content/initials if already in cache
  const initialCached = useMemo(() => {
    if (!optimizedUrl) return null;
    return getCachedImageUrl(optimizedUrl) || (isImageCached(optimizedUrl) ? optimizedUrl : null);
  }, [optimizedUrl]);

  const [displaySrc, setDisplaySrc] = useState<string | null>(initialCached);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    initialCached ? 'loaded' : optimizedUrl ? 'loading' : 'error'
  );
  const [isVisible, setIsVisible] = useState<boolean>(!lazy || Boolean(initialCached));

  // Memoized Initials & Background
  const initialsText = useMemo(() => getInitials(name), [name]);
  const bgGradient = useMemo(() => getInitialsBgGradient(name), [name]);

  // Intersection Observer for lazy loading when scrolling long chat lists
  useEffect(() => {
    if (!lazy || isVisible || !containerRef.current) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [lazy, isVisible]);

  // Preload & Cache Image effect when element becomes visible
  useEffect(() => {
    if (!optimizedUrl) {
      setStatus('error');
      setDisplaySrc(null);
      return;
    }

    // If already loaded in state matching optimizedUrl, noop
    if (displaySrc === optimizedUrl && status === 'loaded') {
      return;
    }

    let isSubscribed = true;

    if (isVisible) {
      if (isImageCached(optimizedUrl)) {
        setDisplaySrc(optimizedUrl);
        setStatus('loaded');
      } else {
        setStatus('loading');
        preloadImage(optimizedUrl, size)
          .then((cachedUrl) => {
            if (isSubscribed) {
              setDisplaySrc(cachedUrl);
              setStatus('loaded');
            }
          })
          .catch(() => {
            if (isSubscribed) {
              setStatus('error');
              setDisplaySrc(null);
            }
          });
      }
    }

    return () => {
      isSubscribed = false;
    };
  }, [optimizedUrl, isVisible, size, displaySrc, status]);

  // Handle click callback safely
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) {
        onClick(e);
      }
    },
    [onClick]
  );

  return (
    <div
      ref={containerRef}
      className={`cached-avatar-container ${className}`}
      onClick={handleClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        userSelect: 'none',
        background: status === 'loaded' ? 'transparent' : bgGradient,
        color: '#ffffff',
        fontWeight: 700,
        fontSize: `${Math.max(12, Math.round(size * 0.38))}px`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
    >
      {status === 'loaded' && displaySrc ? (
        <img
          src={displaySrc}
          alt={alt || name || 'Avatar'}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            transition: 'opacity 0.2s ease-in-out',
            opacity: 1,
          }}
          onError={() => setStatus('error')}
        />
      ) : (
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {initialsText}
        </span>
      )}

      {showOnlineBadge && (
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: `${Math.max(10, Math.round(size * 0.22))}px`,
            height: `${Math.max(10, Math.round(size * 0.22))}px`,
            borderRadius: '50%',
            background: isOnline ? '#00A884' : '#8696a0',
            border: '2px solid #111b21',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)',
          }}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
});

CachedAvatar.displayName = 'CachedAvatar';
