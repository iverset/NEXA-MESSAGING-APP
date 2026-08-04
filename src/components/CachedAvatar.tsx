import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GreatMindsRing } from './GreatMindsRing';
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
  lazy = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (onClick) onClick(e);
    },
    [onClick]
  );

  // Compute optimized URL
  const avatarUrl = useMemo(() => {
    if (!src || (!src.startsWith('http') && !src.startsWith('data:'))) {
      return null;
    }
    return optimizeCdnImageUrl(src, size);
  }, [src, size]);

  // Reset state on src change
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const initialsText = useMemo(() => getInitials(name), [name]);
  const bgGradient = useMemo(() => getInitialsBgGradient(name), [name]);

  // If Great Minds AI avatar
  if (src === 'greatminds_ai' || name === 'Great Minds AI') {
    return (
      <div className={`cached-avatar-container ${className}`} onClick={handleClick} style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', ...style }}>
        <GreatMindsRing size={size} animated glow />
      </div>
    );
  }

  return (
    <div
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
        background: bgGradient,
        color: '#ffffff',
        fontWeight: 700,
        fontSize: `${Math.max(12, Math.round(size * 0.38))}px`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: 'none',
        border: 'none',
        ...style,
      }}
    >
      {/* Background Initials (Visible when image is loading or errors) */}
      {!isLoaded && (
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {initialsText}
        </span>
      )}

      {/* Primary Image */}
      {avatarUrl && !hasError && (
        <img
          src={avatarUrl}
          alt={alt || name || 'Avatar'}
          loading={lazy ? 'lazy' : 'eager'}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            transition: 'opacity 0.2s ease-in-out',
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}

      {/* Optional Online Badge */}
      {showOnlineBadge && isOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: `${Math.max(8, Math.round(size * 0.22))}px`,
            height: `${Math.max(8, Math.round(size * 0.22))}px`,
            borderRadius: '50%',
            background: '#00A884',
            border: '2px solid #0A0D16',
            zIndex: 3,
          }}
        />
      )}
    </div>
  );
});

CachedAvatar.displayName = 'CachedAvatar';
