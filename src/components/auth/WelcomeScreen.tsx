import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="nexa-auth-card">
      <div className="nexa-auth-logo-icon" style={{ overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
        <img
          src="/images/app_ai_icon.jpg"
          alt="NEXA Logo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
