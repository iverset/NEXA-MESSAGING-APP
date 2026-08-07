import React, { useEffect } from 'react';
import { NexaAppIcon } from '../NexaAppIcon';

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
        <div style={{ marginBottom: '20px' }}>
          <NexaAppIcon size={72} borderRadius={20} />
        </div>
        <div className="nexa-splash-wordmark">NEXA</div>
        <div className="nexa-splash-tagline">Communication Platform</div>
      </div>
    </div>
  );
};
