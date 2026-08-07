import React, { useState } from 'react';
import { NexaAppIcon } from '../NexaAppIcon';
import { ChevronDown, Loader2 } from 'lucide-react';
import { CountryCode } from './types';

interface PhoneSignInScreenProps {
  selectedCountry: CountryCode;
  phoneInput: string;
  onPhoneChange: (val: string) => void;
  onOpenCountryModal: () => void;
  onSubmit: () => void;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
}

export const PhoneSignInScreen: React.FC<PhoneSignInScreenProps> = ({
  selectedCountry,
  phoneInput,
  onPhoneChange,
  onOpenCountryModal,
  onSubmit,
  errorMsg,
  isLoading,
  isShaking,
}) => {
  const rawDigits = phoneInput.replace(/[^0-9]/g, '');
  const isValid = rawDigits.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className={`nexa-auth-card ${isShaking ? 'shake' : ''}`}>
      <div style={{ marginBottom: '20px' }}>
        <NexaAppIcon size={56} borderRadius={16} />
      </div>

      <h1 className="nexa-auth-title">Sign in to Nexa</h1>
      <p className="nexa-auth-subtitle">
        Enter your phone number to continue.
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
            value={phoneInput}
            onChange={(e) => onPhoneChange(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="nexa-auth-btn-primary"
          disabled={!isValid || isLoading}
          style={{ marginTop: '10px' }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Continue'}
        </button>
      </form>
    </div>
  );
};
