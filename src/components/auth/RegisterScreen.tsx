import React, { useState } from 'react';
import { NexaAppIcon } from '../NexaAppIcon';
import { Mail, ChevronDown, Lock, Eye, EyeOff, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CountryCode } from './types';
import { calculatePasswordStrength } from '../../services/AuthService';

interface RegisterScreenProps {
  selectedCountry: CountryCode;
  onOpenCountryModal: () => void;
  onSubmit: (data: { email: string; phone: string }) => void;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  selectedCountry,
  onOpenCountryModal,
  onSubmit,
  errorMsg,
  isLoading,
  isShaking,
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const rawPhone = phone.replace(/[^0-9]/g, '');
  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidPhone = rawPhone.length >= 6;
  const isValid = isValidEmail && isValidPhone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit({
        email: email.trim().toLowerCase(),
        phone: `${selectedCountry.dial} ${phone.trim()}`,
      });
    }
  };

  return (
    <div className={`nexa-auth-card ${isShaking ? 'shake' : ''}`} style={{ maxWidth: '420px' }}>
      <div style={{ marginBottom: '20px' }}>
        <NexaAppIcon size={56} borderRadius={16} />
      </div>

      <h1 className="nexa-auth-title">Create your Nexa Account</h1>
      <p className="nexa-auth-subtitle">
        Enter your email address and phone number to begin account setup.
      </p>

      {errorMsg && <div className="nexa-auth-error">{errorMsg}</div>}

      <form className="nexa-auth-form" onSubmit={handleSubmit}>
        {/* Email Address */}
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

        {/* Country Picker */}
        <div style={{ textAlign: 'left', marginTop: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', display: 'block' }}>
            Country / Region
          </label>
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
        </div>

        {/* Phone Input Row */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', display: 'block' }}>
            Phone Number
          </label>
          <div className="nexa-phone-input-row">
            <span className="nexa-phone-dial-badge">{selectedCountry.dial}</span>
            <input
              type="tel"
              className="nexa-phone-input"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="nexa-auth-btn-primary"
          disabled={!isValid || isLoading}
          style={{ marginTop: '12px' }}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Phone & Continue'}
        </button>
      </form>
    </div>
  );
};
