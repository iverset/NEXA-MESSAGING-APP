import React from 'react';

interface GreatMindsRingProps {
  size?: number;
  className?: string;
  animated?: boolean;
  glow?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const GreatMindsRing: React.FC<GreatMindsRingProps> = ({
  size = 28,
  className = '',
  animated = true,
  glow = true,
  onClick,
  title = 'Great Minds AI',
}) => {
  return (
    <div
      onClick={onClick}
      title={title}
      className={`great-minds-ring-wrapper ${animated ? 'animated' : ''} ${glow ? 'with-glow' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
      }}
      role={onClick ? 'button' : 'img'}
      aria-label="Great Minds AI"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="gmAiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="35%" stopColor="#00C6FF" />
            <stop offset="70%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#00B0FF" />
          </linearGradient>

          <filter id="gmGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow Ring */}
        {glow && (
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#gmAiGrad)"
            strokeWidth="10"
            opacity="0.5"
            filter="url(#gmGlow)"
          />
        )}

        {/* Main Iridescent Ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#gmAiGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          className="gm-ring-path"
        />
      </svg>

      {/* Central Glowing AI Icon Image */}
      <div
        style={{
          width: `${Math.round(size * 0.62)}px`,
          height: `${Math.round(size * 0.62)}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
          background: '#0B111D',
        }}
      >
        <img
          src="/images/app_ai_icon.jpg"
          alt="Great Minds AI"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};
