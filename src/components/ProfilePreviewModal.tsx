import React, { useState } from 'react';
import { CachedAvatar } from './CachedAvatar';
import { optimizeCdnImageUrl } from '../services/ImageCacheService';

function initials(name: string): string {
  if (!name) return '??';
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function renderAvatar(avatarStr?: string, nameStr?: string) {
  if (avatarStr && (avatarStr.startsWith('http') || avatarStr.startsWith('data:'))) {
    return (
      <img
        src={avatarStr}
        alt={nameStr || 'Avatar'}
        referrerPolicy="no-referrer"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return initials(nameStr || '');
}

export interface ProfilePreviewTarget {
  id?: string | number;
  name: string;
  avatar?: string;
  statusText?: string;
  bio?: string;
}

interface ProfilePreviewModalProps {
  target: ProfilePreviewTarget;
  initialMode?: 'card' | 'fullscreen';
  onClose: () => void;
  onOpenChat?: (target: ProfilePreviewTarget) => void;
  onVoiceCall?: (target: ProfilePreviewTarget) => void;
  onVideoCall?: (target: ProfilePreviewTarget) => void;
  onOpenInfo?: (target: ProfilePreviewTarget) => void;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  target,
  initialMode = 'card',
  onClose,
  onOpenChat,
  onVoiceCall,
  onVideoCall,
  onOpenInfo,
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'fullscreen'>(initialMode);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [privacyNotice, setPrivacyNotice] = useState<string | null>(null);

  const isImageAvatar =
    target.avatar &&
    (target.avatar.startsWith('http') || target.avatar.startsWith('data:'));

  const handleDoubleTapZoom = () => {
    setZoomScale((prev) => (prev > 1 ? 1 : 2.2));
  };

  const handleAttemptSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setPrivacyNotice('Screenshot & photo downloads are restricted for user privacy 🔒');
    setTimeout(() => setPrivacyNotice(null), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
      }}
      onClick={onClose}
    >
      {/* 1. QUICK PREVIEW CARD MODE */}
      {viewMode === 'card' && (
        <div
          style={{
            width: '280px',
            maxWidth: '90vw',
            background: 'var(--bg-1, #111b21)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header overlay with name */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.3))',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {target.name}
            </div>
          </div>

          {/* Square Photo Box - Tapping expands to Full-Screen */}
          <div
            style={{
              width: '280px',
              height: '280px',
              background: !isImageAvatar ? target.avatar || 'var(--bg-3, #222e35)' : '#0a1014',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            onClick={() => setViewMode('fullscreen')}
            title="Tap to expand full screen"
          >
            <CachedAvatar src={target.avatar} name={target.name} size={280} style={{ borderRadius: 0 }} />
            
            {/* Visual expand badge prompt */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#fff',
              }}
            >
              ⛶
            </div>
          </div>

          {/* Contextual Quick Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '12px 8px',
              background: 'var(--bg-2, #202c33)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* 💬 Message */}
            <button
              onClick={() => {
                if (onOpenChat) onOpenChat(target);
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-1, #00A884)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '20px',
                padding: '6px 10px',
                borderRadius: '8px',
              }}
              title="Message"
            >
              <span>💬</span>
            </button>

            {/* 📞 Voice Call */}
            <button
              onClick={() => {
                if (onVoiceCall) onVoiceCall(target);
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-1, #00A884)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '20px',
                padding: '6px 10px',
                borderRadius: '8px',
              }}
              title="Voice Call"
            >
              <span>📞</span>
            </button>

            {/* 📹 Video Call */}
            <button
              onClick={() => {
                if (onVideoCall) onVideoCall(target);
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-1, #00A884)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '20px',
                padding: '6px 10px',
                borderRadius: '8px',
              }}
              title="Video Call"
            >
              <span>📹</span>
            </button>

            {/* ℹ️ Info ("i") */}
            <button
              onClick={() => {
                if (onOpenInfo) onOpenInfo(target);
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-1, #00A884)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '20px',
                padding: '6px 10px',
                borderRadius: '8px',
              }}
              title="Contact Info"
            >
              <span>ℹ️</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. FULL SCREEN PHOTO MODE */}
      {viewMode === 'fullscreen' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100000,
          }}
          onClick={() => setShowControls((prev) => !prev)}
          onContextMenu={handleAttemptSave}
        >
          {/* Top Bar Overlay */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.25s ease',
              pointerEvents: showControls ? 'auto' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ←
              </button>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{target.name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>🔒 Screen capture & save disabled for privacy</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleDoubleTapZoom}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {zoomScale > 1 ? 'Reset Zoom' : '2x Zoom'}
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '22px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Photo Display Viewport with Scale Zoom & Gesture Double-tap */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'zoom-in',
            }}
            onDoubleClick={handleDoubleTapZoom}
          >
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
                maxHeight: '85vh',
                maxWidth: '90vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isImageAvatar ? (
                <img
                  src={target.avatar}
                  alt={target.name}
                  style={{
                    maxHeight: '85vh',
                    maxWidth: '90vw',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                  }}
                  onDragStart={handleAttemptSave}
                />
              ) : (
                <div
                  style={{
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: target.avatar || 'var(--bg-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '96px',
                    fontWeight: 700,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
                  }}
                >
                  {renderAvatar(target.avatar, target.name)}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Alert Banner if triggered */}
          {privacyNotice && (
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(20, 20, 20, 0.95)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid var(--accent-1, #00A884)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 100,
                textAlign: 'center',
              }}
            >
              {privacyNotice}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
