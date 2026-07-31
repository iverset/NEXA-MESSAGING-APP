import React from 'react';

interface GetStartedScreenProps {
  onContinue: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  onContinue,
  onOpenLegal,
}) => {
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

      <h1 className="nexa-auth-title">Let's get you connected</h1>
      <p className="nexa-auth-subtitle">
        You will verify your phone number to continue and sync your conversations seamlessly.
      </p>

      <button className="nexa-auth-btn-primary" onClick={onContinue}>
        Continue
      </button>

      <p className="nexa-auth-legal">
        By continuing, you agree to Nexa's{' '}
        <button
          type="button"
          onClick={() => onOpenLegal('terms')}
          style={{
            background: 'none',
            border: 'none',
            color: '#2AABEE',
            cursor: 'pointer',
            padding: 0,
            fontSize: 'inherit',
            textDecoration: 'underline',
          }}
        >
          Terms of Service
        </button>{' '}
        and{' '}
        <button
          type="button"
          onClick={() => onOpenLegal('privacy')}
          style={{
            background: 'none',
            border: 'none',
            color: '#2AABEE',
            cursor: 'pointer',
            padding: 0,
            fontSize: 'inherit',
            textDecoration: 'underline',
          }}
        >
          Privacy Policy
        </button>
        .
      </p>
    </div>
  );
};
