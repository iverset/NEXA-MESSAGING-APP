import React from 'react';
import { NexaAppIcon } from '../NexaAppIcon';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="nexa-auth-card">
      <div style={{ marginBottom: '20px' }}>
        <NexaAppIcon size={56} borderRadius={16} />
      </div>

      <h1 className="nexa-auth-title">Welcome to Nexa</h1>
      <p className="nexa-auth-subtitle">
        Fast, secure, and reliable messaging for everyone.
      </p>

      <button
        className="nexa-auth-btn-primary"
        onClick={onGetStarted}
      >
        Get Started
      </button>
    </div>
  );
};
