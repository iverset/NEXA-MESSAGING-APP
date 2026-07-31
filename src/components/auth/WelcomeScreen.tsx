import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="nexa-auth-card">
      <div className="nexa-auth-logo-icon">
        <svg viewBox="0 0 40 40" fill="none" style={{ width: '32px', height: '32px' }}>
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
