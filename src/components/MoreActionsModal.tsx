import React, { useState } from 'react';
import { Search, Bell, BellOff, Image, Folder, Timer, Share2, Pin, Trash2, AlertTriangle, Ban, LogOut, X } from 'lucide-react';
import { ChatRoom, ChatMessage } from '../types';

interface MoreActionsModalProps {
  room?: ChatRoom;
  roomName?: string;
  isMuted?: boolean;
  disappearingTimer?: string;
  messages?: ChatMessage[];
  onOpenSearch?: () => void;
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
  onOpenSearch,
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
          background: '#1f2c38',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
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
                background: '#17212b',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Options • {displayName}</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a7b2bf', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Search in chat */}
              {onOpenSearch && (
                <button
                  onClick={() => {
                    onOpenSearch();
                    onClose();
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e9edf0',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Search size={18} color="#8774e1" /> Search in Chat
                </button>
              )}

              {/* Mute Notifications */}
              {onOpenMuteModal && (
                <button
                  onClick={() => {
                    onOpenMuteModal();
                    onClose();
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e9edf0',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isMuted ? <Bell size={18} color="#8774e1" /> : <BellOff size={18} color="#8774e1" />}
                    <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                  </div>
                  {isMuted && <span style={{ fontSize: '12px', color: '#8774e1', fontWeight: 600 }}>Muted</span>}
                </button>
              )}

              {/* Chat Wallpaper / Theme */}
              {onOpenWallpaperModal && (
                <button
                  onClick={() => {
                    onOpenWallpaperModal();
                    onClose();
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e9edf0',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Image size={18} color="#8774e1" /> Change Wallpaper
                </button>
              )}

              {/* Shared Media */}
              {onOpenSharedMediaModal && (
                <button
                  onClick={() => {
                    onOpenSharedMediaModal();
                    onClose();
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e9edf0',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Folder size={18} color="#8774e1" /> Shared Media & Files
                </button>
              )}

              {/* Auto-Delete Messages */}
              {onOpenDisappearingModal && (
                <button
                  onClick={() => {
                    onOpenDisappearingModal();
                    onClose();
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e9edf0',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Timer size={18} color="#8774e1" />
                    <span>Auto-Delete Timer</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#a7b2bf' }}>{disappearingTimer}</span>
                </button>
              )}

              {/* Export Chat */}
              <button
                onClick={() => {
                  onExportChat?.();
                  onClose();
                }}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e9edf0',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Share2 size={18} color="#8774e1" /> Export Chat History
              </button>

              {/* Add Shortcut */}
              <button
                onClick={() => {
                  onAddShortcut?.();
                  onClose();
                }}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e9edf0',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Pin size={18} color="#8774e1" /> Add to Home Screen
              </button>

              {/* Clear Chat */}
              <button
                onClick={() => setActivePrompt('clear')}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#e9edf0',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Trash2 size={18} color="#8774e1" /> Clear Chat
              </button>

              {/* Report */}
              <button
                onClick={() => setActivePrompt('report')}
                style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#FF5C5C',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <AlertTriangle size={18} color="#FF5C5C" /> Report {isGroup ? 'Group' : 'Contact'}
              </button>

              {/* Block (1-on-1) or Exit Group (Group) */}
              {!isGroup && handleBlock && (
                <button
                  onClick={() => setActivePrompt('block')}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#FF5C5C',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <Ban size={18} color="#FF5C5C" /> Block {displayName}
                </button>
              )}

              {isGroup && onExitGroup && (
                <button
                  onClick={() => setActivePrompt('exit')}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#FF5C5C',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <LogOut size={18} color="#FF5C5C" /> Exit Group
                </button>
              )}
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
