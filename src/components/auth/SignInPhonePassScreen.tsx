import React, { useState } from 'react';
import { ChevronDown, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { CountryCode } from './types';

interface SignInPhonePassScreenProps {
  selectedCountry: CountryCode;
  onOpenCountryModal: () => void;
  onSubmit: (phone: string, pass: string) => void;
  onSwitchToEmail: () => void;
  onSwitchToOtp: () => void;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
}

export const SignInPhonePassScreen: React.FC<SignInPhonePassScreenProps> = ({
  selectedCountry,
  onOpenCountryModal,
  onSubmit,
  onSwitchToEmail,
  onSwitchToOtp,
  errorMsg,
  isLoading,
  isShaking,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const rawPhone = phone.replace(/[^0-9]/g, '');
  const isValid = rawPhone.length >= 6 && password.length >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit(`${selectedCountry.dial} ${phone.trim()}`, password);
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

      <h1 className="nexa-auth-title">Phone & Password Sign In</h1>
      <p className="nexa-auth-subtitle">
        Enter your phone number and password to sign in.
      </p>

      {errorMsg && <div className="nexa-auth-error">{errorMsg}</div>}

      <form className="nexa-auth-form" onSubmit={handleSubmit}>
        {/* Country Selector */}
        <button
          type="button"
          className="nexa-country-select-btn"
          onClick={onOpenCountryModal}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{selectedCountry.flag}</span>
            <span style={{ fontWeight: 500 }}>{selectedCountry.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#2AABEE', fontWeight: 600 }}>{selectedCountry.dial}</span>
            <ChevronDown size={16} style={{ opacity: 0.6 }} />
          </div>
        </button>

        {/* Phone Input Row */}
        <div className="nexa-phone-input-row">
          <span className="nexa-phone-dial-badge">{selectedCountry.dial}</span>
          <input
            type="tel"
            className="nexa-phone-input"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
        </div>

        {/* Password */}
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
          onClick={onSwitchToEmail}
          style={{ background: 'none', border: 'none', color: '#2AABEE', cursor: 'pointer', padding: 0 }}
        >
          Sign in with Email
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
