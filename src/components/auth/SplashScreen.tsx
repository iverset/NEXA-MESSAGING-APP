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
        <div className="nexa-splash-icon" style={{ overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
          <img
            src="/images/app_ai_icon.jpg"
            alt="NEXA Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="nexa-splash-wordmark">NEXA</div>
        <div className="nexa-splash-tagline">Communication Platform</div>
      </div>
    </div>
  );
};
