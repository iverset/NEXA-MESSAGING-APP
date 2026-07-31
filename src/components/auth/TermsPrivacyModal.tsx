import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface TermsPrivacyModalProps {
  type: 'terms' | 'privacy';
  onClose: () => void;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({ type, onClose }) => {
  const isTerms = type === 'terms';

  return (
    <div className="nexa-country-modal-overlay" onClick={onClose}>
      <div className="nexa-country-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="nexa-country-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isTerms ? <FileText size={18} style={{ color: '#2AABEE' }} /> : <ShieldCheck size={18} style={{ color: '#2AABEE' }} />}
            <span className="nexa-country-modal-title">
              {isTerms ? 'Nexa Terms of Service' : 'Nexa Privacy Policy'}
            </span>
          </div>
          <button className="nexa-auth-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-1)' }}>
          {isTerms ? (
            <>
              <h3 style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                1. Acceptance of Terms
              </h3>
              <p style={{ marginBottom: '14px' }}>
                By accessing or using Nexa, you agree to be bound by these Terms of Service. Nexa provides end-to-end encrypted and cloud-synced communication tools across web and mobile applications.
              </p>
              <h3 style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                2. User Account & Phone Verification
              </h3>
              <p style={{ marginBottom: '14px' }}>
                Accounts are authenticated primarily via verified phone numbers and multi-factor security mechanisms. You are responsible for keeping your credentials and device access secure.
              </p>
              <h3 style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                3. Acceptable Use Policy
              </h3>
              <p style={{ marginBottom: '14px' }}>
                You agree not to engage in spamming, illegal activities, or unauthorized network disruption using Nexa infrastructure.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                1. Privacy Commitment
              </h3>
              <p style={{ marginBottom: '14px' }}>
                Nexa respects your privacy. Messages, call telemetry, and media assets are secured with strict encryption and zero-knowledge storage protocols where applicable.
              </p>
              <h3 style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                2. Data We Collect
              </h3>
              <p style={{ marginBottom: '14px' }}>
                We collect your phone number for account identification and authentication. We do not sell your personal data or share your conversation content with third parties.
              </p>
              <h3 style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                3. Session & Device Security
              </h3>
              <p style={{ marginBottom: '14px' }}>
                Active sessions can be reviewed and terminated by you at any time from your Nexa security settings dashboard.
              </p>
            </>
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
          <button className="nexa-auth-btn-primary" onClick={onClose} style={{ height: '38px', fontSize: '13.5px' }}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
