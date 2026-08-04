import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface PinnedMessagesModalProps {
  pinnedMessages: ChatMessage[];
  onJumpToMessage: (msgId?: string, text?: string) => void;
  onUnpinMessage: (msg: ChatMessage) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
  pinnedMessages,
  onJumpToMessage,
  onUnpinMessage,
  onClose,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = pinnedMessages.filter((m) =>
    (m.text || m.name || m.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          width: '540px',
          maxWidth: '92vw',
          maxHeight: '80vh',
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
            <span style={{ fontSize: '22px' }}>📌</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>Pinned Messages</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                {pinnedMessages.length} Pinned Items in this Chat
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

        {/* Search inside Pinned */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-2, #202c33)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <input
            type="text"
            placeholder="🔍 Search inside pinned messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Pinned Items List */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
              No pinned messages match your search.
            </div>
          ) : (
            filtered.map((msg, idx) => (
              <div
                key={msg.id || idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-2, #202c33)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div
                  style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
                  onClick={() => {
                    onJumpToMessage(msg.id, msg.text);
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-1, #00A884)' }}>
                      {msg.from === 'me' ? 'You' : msg.senderName || 'User'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{msg.time}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.9)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {msg.text || (msg.type === 'photo' ? '📷 Photo Attachment' : msg.type === 'doc' ? '📄 Document' : 'Media')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      onJumpToMessage(msg.id, msg.text);
                      onClose();
                    }}
                    style={{
                      background: 'var(--accent-1, #00A884)',
                      border: 'none',
                      color: '#000',
                      fontWeight: 700,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Jump ↗
                  </button>

                  <button
                    onClick={() => {
                      onUnpinMessage(msg);
                      onToast('Message unpinned');
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    title="Unpin"
                  >
                    📌✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
