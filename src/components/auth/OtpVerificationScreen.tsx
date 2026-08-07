import React, { useRef, useEffect } from 'react';
import { NexaAppIcon } from '../NexaAppIcon';
import { Edit2, Loader2 } from 'lucide-react';

interface OtpVerificationScreenProps {
  phoneDisplay: string;
  otpValues: string[];
  onOtpValuesChange: (vals: string[]) => void;
  onEditPhone: () => void;
  onConfirm: (code: string) => void;
  onResend: () => void;
  resendTimer: number;
  errorMsg: string;
  isLoading: boolean;
  isShaking: boolean;
  demoOtpCode?: string;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  phoneDisplay,
  otpValues,
  onOtpValuesChange,
  onEditPhone,
  onConfirm,
  onResend,
  resendTimer,
  errorMsg,
  isLoading,
  isShaking,
  demoOtpCode = '123456',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = char;
    onOtpValuesChange(newOtp);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) {
      onConfirm(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    onOtpValuesChange(newOtp);

    if (pasted.length === 6) {
      onConfirm(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const isComplete = otpValues.join('').length === 6;

  return (
    <div className={`nexa-auth-card ${isShaking ? 'shake' : ''}`}>
      <div style={{ marginBottom: '20px' }}>
        <NexaAppIcon size={56} borderRadius={16} />
      </div>

      <h1 className="nexa-auth-title">Verify your number</h1>
      <p className="nexa-auth-subtitle" style={{ marginBottom: '16px' }}>
        We've sent a verification code to{' '}
        <strong style={{ color: 'var(--text-0)' }}>{phoneDisplay}</strong>{' '}
        <button
          type="button"
          className="nexa-edit-phone-btn"
          onClick={onEditPhone}
        >
          <Edit2 size={12} style={{ marginRight: '2px' }} />
          Edit
        </button>
      </p>

      {errorMsg && <div className="nexa-auth-error">{errorMsg}</div>}

      {demoOtpCode && (
        <div
          style={{
            background: 'rgba(42, 171, 238, 0.12)',
            border: '1px solid rgba(42, 171, 238, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '14px',
            fontSize: '12.5px',
            color: '#2AABEE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span>Your Verification OTP: </span>
            <strong style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '14px', color: '#ffffff' }}>
              {demoOtpCode}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => {
              const chars = demoOtpCode.split('');
              onOtpValuesChange(chars);
              onConfirm(demoOtpCode);
            }}
            style={{
              background: '#2AABEE',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Auto-fill
          </button>
        </div>
      )}

      <div className="nexa-otp-grid">
        {otpValues.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={`nexa-otp-digit ${val ? 'filled' : ''}`}
            value={val}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <button
        type="button"
        className="nexa-auth-btn-primary"
        onClick={() => onConfirm(otpValues.join(''))}
        disabled={isLoading || !isComplete}
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Code'}
      </button>

      <div className="nexa-otp-resend-bar">
        {resendTimer > 0 ? (
          <span>Resend code in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            className="nexa-otp-resend-btn"
            onClick={onResend}
          >
            Resend code
          </button>
        )}
      </div>
    </div>
  );
};
