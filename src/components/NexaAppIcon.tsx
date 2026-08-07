import React, { useState } from 'react';

interface NexaAppIconProps {
  size?: number | string;
  borderRadius?: number | string;
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
}

export const NexaAppIcon: React.FC<NexaAppIconProps> = ({
  size = 56,
  borderRadius = 16,
  style = {},
  className = '',
  alt = 'NEXA App Icon',
}) => {
  const [loaded, setLoaded] = useState(true);
  const [error, setError] = useState(false);

  const dimension = typeof size === 'number' ? `${size}px` : size;
  const radius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <div
      className={`nexa-app-icon-container ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: radius,
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B132B',
        boxShadow: '0 0 16px rgba(0, 240, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* 0ms Instant SVG Vector Fallback & Background Layer */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="nexaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#4FACFE" />
            <stop offset="100%" stopColor="#00C6FF" />
          </linearGradient>
          <filter id="nexaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Background dark tile */}
        <rect width="100" height="100" fill="#0A1128" rx="20" />
        {/* Circuit lines */}
        <path d="M 15 20 L 30 20 L 40 30" stroke="#00F2FE" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M 85 80 L 70 80 L 60 70" stroke="#00F2FE" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M 20 85 L 20 70 L 30 60" stroke="#00C6FF" strokeWidth="1" opacity="0.3" fill="none" />
        <path d="M 80 15 L 80 30 L 70 40" stroke="#00C6FF" strokeWidth="1" opacity="0.3" fill="none" />
        {/* Stylized Glowing N */}
        <path
          d="M 28 75 L 28 25 L 72 75 L 72 25"
          fill="none"
          stroke="url(#nexaGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#nexaGlow)"
        />
        {/* Sparkle Nodes */}
        <circle cx="28" cy="25" r="4.5" fill="#FFFFFF" />
        <circle cx="72" cy="75" r="4.5" fill="#FFFFFF" />
      </svg>

      {/* Main High-Res Generated Image */}
      {!error && (
        <img
          src="/images/nexa_app_logo.jpg"
          alt={alt}
          loading="eager"
          decoding="sync"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.15s ease-in-out',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
};
