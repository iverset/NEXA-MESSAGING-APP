import React from 'react';
import { ShieldAlert, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface SecurityRecommendationModalProps {
  onEnableNow: () => void;
  onRemindLater: () => void;
  onSkip: () => void;
}

export const SecurityRecommendationModal: React.FC<SecurityRecommendationModalProps> = ({
  onEnableNow,
  onRemindLater,
  onSkip,
}) => {
  return (
    <div className="nexa-auth-card" style={{ maxWidth: '420px' }}>
      <div
        className="nexa-auth-logo-icon"
        style={{ background: 'rgba(42, 171, 238, 0.15)', color: '#2AABEE' }}
      >
        <ShieldCheck size={32} />
      </div>

      <h1 className="nexa-auth-title">Protect Your Account</h1>
      <p className="nexa-auth-subtitle" style={{ fontSize: '14px', lineHeight: '1.5' }}>
        We recommend enabling an additional two-step verification password to protect your Nexa account if your device is lost or compromised.
      </p>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
          borderRadius: '10px',
          padding: '12px 14px',
          margin: '16px 0',
          textAlign: 'left',
          fontSize: '12.5px',
          color: 'var(--text-1)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-0)', marginBottom: '4px' }}>
          Key Benefits of Two-Step Verification:
        </div>
        <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Requires an additional password when logging in on new devices.</li>
          <li>Prevents unauthorized phone SIM swap access.</li>
          <li>Recovery via personal email address.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="nexa-auth-btn-primary" onClick={onEnableNow}>
          <span>Enable Two-Step Verification Now</span>
          <ArrowRight size={16} style={{ marginLeft: '6px' }} />
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="nexa-country-select-btn"
            onClick={onRemindLater}
            style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}
          >
            Remind Me Later
          </button>
          <button
            className="nexa-country-select-btn"
            onClick={onSkip}
            style={{ flex: 1, justifyContent: 'center', fontSize: '13px', color: 'var(--text-2)' }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
