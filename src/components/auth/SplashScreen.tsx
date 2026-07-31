import React, { useEffect } from 'react';

interface SplashScreenProps {
  onNext: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNext }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="nexa-auth-card" onClick={onNext} style={{ cursor: 'pointer' }}>
      <div className="nexa-splash-logo">
        <div className="nexa-splash-icon">
          <svg viewBox="0 0 40 40" fill="none" style={{ width: '42px', height: '42px' }}>
            <path
              d="M10 30V10L30 30V10"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="30" cy="9" r="2.5" fill="#ffffff" />
          </svg>
        </div>
        <div className="nexa-splash-wordmark">NEXA</div>
        <div className="nexa-splash-tagline">Communication Platform</div>
      </div>
    </div>
  );
};
