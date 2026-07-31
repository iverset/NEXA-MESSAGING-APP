import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, HelpCircle } from 'lucide-react';

interface TwoStepChallengeModalProps {
  hint?: string;
  onSubmit: (password: string) => void;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
}

export const TwoStepChallengeModal: React.FC<TwoStepChallengeModalProps> = ({
  hint,
  onSubmit,
  errorMsg,
  isLoading,
  isShaking,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && !isLoading) {
      onSubmit(password);
    }
  };

  return (
    <div className={`nexa-auth-card ${isShaking ? 'shake' : ''}`} style={{ maxWidth: '420px' }}>
      <div className="nexa-auth-logo-icon">
        <Lock size={28} style={{ color: '#2AABEE' }} />
      </div>

      <h1 className="nexa-auth-title">Two-Step Verification</h1>
      <p className="nexa-auth-subtitle">
        Your account is protected by an additional two-step verification password. Please enter it below.
      </p>

      {errorMsg && <div className="nexa-auth-error">{errorMsg}</div>}

      <form className="nexa-auth-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', display: 'block' }}>
            Two-Step Password
          </label>
          <div className="nexa-phone-input-row" style={{ paddingLeft: '12px' }}>
            <Lock size={16} style={{ color: '#2AABEE' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="nexa-phone-input"
              placeholder="Enter 2-step password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <button
              type="button"
              className="nexa-auth-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              style={{ paddingRight: '12px' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {hint && (
          <div style={{ textAlign: 'left', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2AABEE',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              <HelpCircle size={14} />
              <span>{showHint ? 'Hide Password Hint' : 'Show Password Hint'}</span>
            </button>
            {showHint && (
              <div
                style={{
                  marginTop: '4px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '12px',
                  color: 'var(--text-1)',
                }}
              >
                Hint: {hint}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="nexa-auth-btn-primary"
          disabled={!password || isLoading}
          style={{ marginTop: '12px' }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Continue'}
        </button>
      </form>
    </div>
  );
};
