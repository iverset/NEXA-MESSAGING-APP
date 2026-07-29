import React, { useState } from 'react';

interface MutePickerModalProps {
  roomName: string;
  onConfirmMute: (duration: string, showNotifications: boolean) => void;
  onClose: () => void;
}

export const MutePickerModal: React.FC<MutePickerModalProps> = ({
  roomName,
  onConfirmMute,
  onClose,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<'8 Hours' | '1 Week' | 'Always'>('8 Hours');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

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
          width: '380px',
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
          🔕 Mute notifications for {roomName}?
        </div>
        <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
          Other members will not see that you muted this conversation.
        </div>

        {/* Options Radio List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {(['8 Hours', '1 Week', 'Always'] as const).map((dur) => (
            <div
              key={dur}
              onClick={() => setSelectedDuration(dur)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: selectedDuration === dur ? 'rgba(0, 168, 132, 0.15)' : 'rgba(255,255,255,0.04)',
                border: selectedDuration === dur ? '1px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{dur}</span>
              <span style={{ color: 'var(--accent-1, #00A884)', fontWeight: 700 }}>
                {selectedDuration === dur ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Show notifications checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <input
            type="checkbox"
            id="showNotifs"
            checked={showNotifications}
            onChange={(e) => setShowNotifications(e.target.checked)}
            style={{ accentColor: 'var(--accent-1, #00A884)', cursor: 'pointer', width: '16px', height: '16px' }}
          />
          <label htmlFor="showNotifs" style={{ fontSize: '13px', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
            Show notifications without sound
          </label>
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
              onConfirmMute(selectedDuration, showNotifications);
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
            Mute
          </button>
        </div>
      </div>
    </div>
  );
};
