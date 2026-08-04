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
      <div className="nexa-auth-logo-icon" style={{ overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
        <img
          src="/images/app_ai_icon.jpg"
          alt="NEXA Logo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
