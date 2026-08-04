import React, { useState } from 'react';
import { ChatRoom, ChatMessage } from '../types';

interface MoreActionsModalProps {
  room?: ChatRoom;
  roomName?: string;
  isMuted?: boolean;
  disappearingTimer?: string;
  messages?: ChatMessage[];
  onReport?: () => void;
  onBlock?: () => void;
  onBlockUser?: () => void;
  onExitGroup?: () => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
  onAddShortcut?: () => void;
  onClose: () => void;
  onOpenWallpaperModal?: () => void;
  onOpenSharedMediaModal?: () => void;
  onOpenMuteModal?: () => void;
  onOpenDisappearingModal?: () => void;
  onUnfollowChannel?: () => void;
}

export const MoreActionsModal: React.FC<MoreActionsModalProps> = ({
  room,
  roomName,
  isMuted,
  disappearingTimer,
  messages = [],
  onReport,
  onBlock,
  onBlockUser,
  onExitGroup,
  onClearChat,
  onExportChat,
  onAddShortcut,
  onClose,
  onOpenWallpaperModal,
  onOpenSharedMediaModal,
  onOpenMuteModal,
  onOpenDisappearingModal,
  onUnfollowChannel,
}) => {
  const [activePrompt, setActivePrompt] = useState<'none' | 'report' | 'block' | 'exit' | 'clear'>('none');

  const displayName = room?.name || roomName || 'Chat';
  const isGroup = room?.type === 'group';
  const handleBlock = onBlock || onBlockUser;

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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {activePrompt === 'none' && (
          <>
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
              <div style={{ fontSize: '16px', fontWeight: 700 }}>More Actions • {displayName}</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Report */}
              <button
                onClick={() => setActivePrompt('report')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FF5376',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span>⚠️</span> Report {isGroup ? 'Group' : 'Contact'}
              </button>

              {/* Block (1-on-1) or Exit Group (Group) */}
              {!isGroup && handleBlock && (
                <button
                  onClick={() => setActivePrompt('block')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#FF5376',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>🚫</span> Block {displayName}
                </button>
              )}

              {isGroup && onExitGroup && (
                <button
                  onClick={() => setActivePrompt('exit')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#FF5376',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>🚪</span> Exit Group
                </button>
              )}

              {/* Clear chat */}
              <button
                onClick={() => setActivePrompt('clear')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span>🧹</span> Clear Chat
              </button>

              {/* Export chat */}
              <button
                onClick={() => {
                  onExportChat?.();
                  onClose();
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span>📤</span> Export Chat
              </button>

              {/* Add shortcut */}
              <button
                onClick={() => {
                  onAddShortcut?.();
                  onClose();
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span>📌</span> Add Shortcut
              </button>
            </div>
          </>
        )}

        {/* Confirmatory Sub-Screens */}
        {activePrompt === 'report' && (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FF5376' }}>
              ⚠️ Report {displayName}?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '20px' }}>
              The last 5 messages from this chat will be forwarded to safety moderation. No one in this chat will be notified.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActivePrompt('none')} style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  onReport?.();
                  onClose();
                }}
                style={{ padding: '8px 18px', background: '#FF5376', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
              >
                Report
              </button>
            </div>
          </div>
        )}

        {activePrompt === 'block' && (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FF5376' }}>
              🚫 Block {displayName}?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '20px' }}>
              Blocked contacts will no longer be able to call you or send you messages. This contact will not be notified.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActivePrompt('none')} style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (handleBlock) handleBlock();
                  onClose();
                }}
                style={{ padding: '8px 18px', background: '#FF5376', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
              >
                Block
              </button>
            </div>
          </div>
        )}

        {activePrompt === 'exit' && (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FF5376' }}>
              🚪 Exit "{displayName}"?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '20px' }}>
              Only group admins will be notified that you left the group. You will no longer be able to send messages here.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActivePrompt('none')} style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onExitGroup) onExitGroup();
                  onClose();
                }}
                style={{ padding: '8px 18px', background: '#FF5376', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
              >
                Exit Group
              </button>
            </div>
          </div>
        )}

        {activePrompt === 'clear' && (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
              🧹 Clear this chat?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '20px' }}>
              This will permanently delete all messages in this conversation thread from your local storage.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActivePrompt('none')} style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearChat();
                  onClose();
                }}
                style={{ padding: '8px 18px', background: 'var(--accent-1, #00A884)', border: 'none', color: '#000', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
              >
                Clear Messages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
