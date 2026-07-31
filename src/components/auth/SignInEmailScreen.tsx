import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface SignInEmailScreenProps {
  onSubmit: (email: string, pass: string) => void;
  onSwitchToOtp: () => void;
  onSwitchToPhonePass: () => void;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
}

export const SignInEmailScreen: React.FC<SignInEmailScreenProps> = ({
  onSubmit,
  onSwitchToOtp,
  onSwitchToPhonePass,
  errorMsg,
  isLoading,
  isShaking,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = email.includes('@') && password.length >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit(email.trim().toLowerCase(), password);
    }
  };

  return (
    <div className={`nexa-auth-card ${isShaking ? 'shake' : ''}`} style={{ maxWidth: '420px' }}>
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

      <h1 className="nexa-auth-title">Email & Password Sign In</h1>
      <p className="nexa-auth-subtitle">
        Enter your credentials to sign in to your Nexa account.
      </p>

      {errorMsg && <div className="nexa-auth-error">{errorMsg}</div>}

      <form className="nexa-auth-form" onSubmit={handleSubmit}>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', display: 'block' }}>
            Email Address
          </label>
          <div className="nexa-phone-input-row" style={{ paddingLeft: '12px' }}>
            <Mail size={16} style={{ color: '#2AABEE' }} />
            <input
              type="email"
              className="nexa-phone-input"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', display: 'block' }}>
            Password
          </label>
          <div className="nexa-phone-input-row" style={{ paddingLeft: '12px' }}>
            <Lock size={16} style={{ color: '#2AABEE' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="nexa-phone-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <button
          type="submit"
          className="nexa-auth-btn-primary"
          disabled={!isValid || isLoading}
          style={{ marginTop: '10px' }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '12.5px' }}>
        <button
          type="button"
          onClick={onSwitchToPhonePass}
          style={{ background: 'none', border: 'none', color: '#2AABEE', cursor: 'pointer', padding: 0 }}
        >
          Sign in with Phone & Password
        </button>
        <button
          type="button"
          onClick={onSwitchToOtp}
          style={{ background: 'none', border: 'none', color: '#2AABEE', cursor: 'pointer', padding: 0 }}
        >
          Sign in with OTP
        </button>
      </div>
    </div>
  );
};
