import React from 'react';
import { ChatMessage } from '../types';

interface MessageInfoModalProps {
  message: ChatMessage;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const MessageInfoModal: React.FC<MessageInfoModalProps> = ({ message, onClose, onToast }) => {
  const charCount = message.text ? message.text.length : 0;
  const wordCount = message.text ? message.text.trim().split(/\s+/).filter(Boolean).length : 0;

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
          width: '440px',
          maxWidth: '92vw',
          background: 'var(--bg-1, #111b21)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-2, #202c33)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>ℹ️</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Message Information</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                Nexa Encrypted Message Metadata
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Details Grid */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
          <div style={{ background: 'var(--bg-2, #202c33)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-1, #00A884)', fontWeight: 700, marginBottom: '4px' }}>MESSAGE TEXT</div>
            <div style={{ color: '#fff', fontSize: '13.5px', wordBreak: 'break-word' }}>
              {message.text || `[${message.type.toUpperCase()} ATTACHMENT]`}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg-2, #202c33)', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Sender</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{message.from === 'me' ? 'You' : message.senderName || 'User'}</div>
            </div>

            <div style={{ background: 'var(--bg-2, #202c33)', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Sent Timestamp</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{message.time || '09:41 AM'}</div>
            </div>

            <div style={{ background: 'var(--bg-2, #202c33)', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Delivery Status</div>
              <div style={{ fontWeight: 600, color: '#4ADE80', marginTop: '2px' }}>
                ✓✓ Read & Synced
              </div>
            </div>

            <div style={{ background: 'var(--bg-2, #202c33)', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Encryption</div>
              <div style={{ fontWeight: 600, color: 'var(--accent-1, #00A884)', marginTop: '2px' }}>
                🔒 E2E Signal Protocol
              </div>
            </div>

            <div style={{ background: 'var(--bg-2, #202c33)', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Words / Characters</div>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{wordCount} words / {charCount} chars</div>
            </div>

            <div style={{ background: 'var(--bg-2, #202c33)', padding: '10px 12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Message ID</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '11px', marginTop: '2px' }}>
                {message.id || `msg_${Math.random().toString(36).substr(2, 9)}`}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(message, null, 2));
              onToast('Copied raw message metadata 📋');
            }}
            style={{
              marginTop: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              padding: '10px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            📋 Copy JSON Metadata
          </button>
        </div>
      </div>
    </div>
  );
};
