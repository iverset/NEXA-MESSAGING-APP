import React, { useState } from 'react';

interface DisappearingMessagesModalProps {
  roomName: string;
  currentTimer?: string;
  onConfirm: (timer: string) => void;
  onClose: () => void;
}

export const DisappearingMessagesModal: React.FC<DisappearingMessagesModalProps> = ({
  roomName,
  currentTimer = 'Off',
  onConfirm,
  onClose,
}) => {
  const [selectedTimer, setSelectedTimer] = useState<string>(currentTimer);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '420px',
          maxWidth: '90vw',
          background: 'var(--bg-1, #111b21)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
          ⏳ Disappearing Messages
        </div>
        <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '16px' }}>
          For extra privacy and storage efficiency, new messages in this chat will disappear after the selected duration. Anyone in this chat can change this setting.
        </div>

        {/* Timer Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: '24 Hours', label: '24 Hours' },
            { id: '7 Days', label: '7 Days' },
            { id: '90 Days', label: '90 Days' },
            { id: 'Off', label: 'Off' },
          ].map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTimer(t.id)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: selectedTimer === t.id ? 'rgba(0, 168, 132, 0.15)' : 'rgba(255,255,255,0.04)',
                border: selectedTimer === t.id ? '1px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{t.label}</span>
              <span style={{ color: 'var(--accent-1, #00A884)', fontWeight: 700 }}>
                {selectedTimer === t.id ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedTimer);
              onClose();
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: 'var(--accent-1, #00A884)',
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Save Setting
          </button>
        </div>
      </div>
    </div>
  );
};
