import React from 'react';
import { Mail, Phone, KeyRound, Globe, UserPlus } from 'lucide-react';

interface ChooseMethodScreenProps {
  onSelectRegister: () => void;
  onSelectEmailPass: () => void;
  onSelectPhonePass: () => void;
  onSelectPhoneOtp: () => void;
  onSelectGoogle: () => void;
}

export const ChooseMethodScreen: React.FC<ChooseMethodScreenProps> = ({
  onSelectRegister,
  onSelectEmailPass,
  onSelectPhonePass,
  onSelectPhoneOtp,
  onSelectGoogle,
}) => {
  return (
    <div className="nexa-auth-card" style={{ maxWidth: '420px' }}>
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

      <h1 className="nexa-auth-title">How would you like to sign in?</h1>
      <p className="nexa-auth-subtitle">
        Choose your preferred sign-in method or create a new Nexa account.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        {/* Register New Account */}
        <button
          className="nexa-auth-btn-primary"
          onClick={onSelectRegister}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <UserPlus size={18} />
          <span>Create New Nexa Account</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '8px 0',
            color: 'var(--text-2, rgba(255,255,255,0.4))',
            fontSize: '12px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border, rgba(255,255,255,0.1))' }} />
          <span>OR SIGN IN WITH EXISTING ACCOUNT</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border, rgba(255,255,255,0.1))' }} />
        </div>

        {/* Email + Password */}
        <button
          className="nexa-country-select-btn"
          onClick={onSelectEmailPass}
          style={{ padding: '12px 16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={18} style={{ color: '#2AABEE' }} />
            <span style={{ fontWeight: 500 }}>Email & Password</span>
          </div>
        </button>

        {/* Phone + Password */}
        <button
          className="nexa-country-select-btn"
          onClick={onSelectPhonePass}
          style={{ padding: '12px 16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={18} style={{ color: '#2AABEE' }} />
            <span style={{ fontWeight: 500 }}>Phone & Password</span>
          </div>
        </button>

        {/* Phone + OTP */}
        <button
          className="nexa-country-select-btn"
          onClick={onSelectPhoneOtp}
          style={{ padding: '12px 16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={18} style={{ color: '#2AABEE' }} />
            <span style={{ fontWeight: 500 }}>Phone Number & Verification Code (OTP)</span>
          </div>
        </button>

        {/* Google Sign-In */}
        <button
          className="nexa-country-select-btn"
          onClick={onSelectGoogle}
          style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={18} style={{ color: '#EA4335' }} />
            <span style={{ fontWeight: 500 }}>Continue with Google</span>
          </div>
        </button>
      </div>
    </div>
  );
};
