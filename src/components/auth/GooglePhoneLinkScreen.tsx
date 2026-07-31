import React, { useState } from 'react';
import { Globe, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { CountryCode } from './types';

interface GooglePhoneLinkScreenProps {
  googleEmail: string;
  selectedCountry: CountryCode;
  onOpenCountryModal: () => void;
  onSubmit: (phone: string) => void;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
}

export const GooglePhoneLinkScreen: React.FC<GooglePhoneLinkScreenProps> = ({
  googleEmail,
  selectedCountry,
  onOpenCountryModal,
  onSubmit,
  errorMsg,
  isLoading,
  isShaking,
}) => {
  const [phone, setPhone] = useState('');

  const rawPhone = phone.replace(/[^0-9]/g, '');
  const isValid = rawPhone.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit(`${selectedCountry.dial} ${phone.trim()}`);
    }
  };

  return (
    <div className={`nexa-auth-card ${isShaking ? 'shake' : ''}`} style={{ maxWidth: '420px' }}>
      <div className="nexa-auth-logo-icon" style={{ background: 'rgba(234, 67, 53, 0.15)', color: '#EA4335' }}>
        <Globe size={28} />
      </div>

      <h1 className="nexa-auth-title">Google Sign-In Connected</h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          background: 'rgba(42, 171, 238, 0.1)',
          padding: '8px 14px',
          borderRadius: '8px',
          margin: '12px 0 16px 0',
          fontSize: '13px',
          color: '#2AABEE',
        }}
      >
        <CheckCircle2 size={16} />
        <span>Authenticated as <strong>{googleEmail}</strong></span>
      </div>

      <p className="nexa-auth-subtitle">
        Please provide your phone number to complete account verification and link your session.
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

        <button
          type="submit"
          className="nexa-auth-btn-primary"
          disabled={!isValid || isLoading}
          style={{ marginTop: '10px' }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Verification OTP'}
        </button>
      </form>
    </div>
  );
};
