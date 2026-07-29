import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatRoom, MessageStatus } from '../types';
import { EmojiPicker, AnimatedStickerItem } from './EmojiPicker';
import { LottiePlayer } from './LottiePlayer';
import { SUPPORTED_LANGUAGES, getUIText } from '../services/translator';
import { WallpaperPickerModal } from './WallpaperPickerModal';
import { SharedMediaModal } from './SharedMediaModal';
import { MutePickerModal } from './MutePickerModal';
import { DisappearingMessagesModal } from './DisappearingMessagesModal';
import { MoreActionsModal } from './MoreActionsModal';
import { CachedAvatar } from './CachedAvatar';

interface ChatPanelProps {
  activeRoom: ChatRoom | null;
  messages: ChatMessage[];
  isTyping: boolean;
  targetLang?: string;
  interfaceLang?: string;
  userAvatarUrl?: string;
  userInitials?: string;
  globalWallpaper?: string;
  globalWallpaperDim?: number;
  onSetTargetLang?: (lang: string) => void;
  onTranslateMessage?: (msgIndex: number, targetLang: string) => void;
  onToggleOriginalMessage?: (msgIndex: number) => void;
  onSendMessage: (text: string, replyText?: string) => void;
  onSendAttachment: (type: 'photo' | 'doc' | 'poll' | 'location' | 'contact' | 'sketch' | 'sticker' | 'zip') => void;
  onSendSticker?: (sticker: AnimatedStickerItem) => void;
  onReactMessage: (msgIndex: number, emoji: string) => void;
  onDeleteMessage: (msgIndex: number) => void;
  onOpenProfile: () => void;
  onBackMobile: () => void;
  onToast: (msg: string) => void;
  onApplyWallpaper?: (background: string, dim: number, applyToAll: boolean) => void;
  onClearChat?: () => void;
  onBlockUser?: () => void;
  onExitGroup?: () => void;
  onMuteRoom?: (duration: string) => void;
  onSetDisappearingTimer?: (timer: string) => void;
  onUnfollowChannel?: () => void;
  isHiddenOnMobile: boolean;
}

function initials(name: string): string {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  activeRoom,
  messages,
  isTyping,
  targetLang = 'en',
  interfaceLang = 'en',
  userAvatarUrl,
  userInitials = 'YOU',
  globalWallpaper,
  globalWallpaperDim,
  onSetTargetLang,
  onTranslateMessage,
  onToggleOriginalMessage,
  onSendMessage,
  onSendAttachment,
  onSendSticker,
  onReactMessage,
  onDeleteMessage,
  onOpenProfile,
  onBackMobile,
  onToast,
  onApplyWallpaper,
  onClearChat,
  onBlockUser,
  onExitGroup,
  onMuteRoom,
  onSetDisappearingTimer,
  onUnfollowChannel,
  isHiddenOnMobile,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionBarMsgIdx, setReactionBarMsgIdx] = useState<number | null>(null);
  const [customReactionPickerMsgIdx, setCustomReactionPickerMsgIdx] = useState<number | null>(null);

  // WhatsApp Context Menu & Sub-Modal States
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showSharedMediaModal, setShowSharedMediaModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showUnfollowPrompt, setShowUnfollowPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!activeRoom) {
    return (
      <div className={`main-panel ${isHiddenOnMobile ? 'hide' : ''}`}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'var(--text-1)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div className="logo" style={{ width: '60px', height: '60px' }}>
            <svg viewBox="0 0 40 40" fill="none">
              <path
                d="M10 30V10L30 30V10"
                stroke="currentColor"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="30" cy="9" r="2.6" fill="currentColor" />
            </svg>
          </div>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', color: 'var(--text-0)' }}>
            Communication comes first
          </p>
          <p style={{ fontSize: '12.5px', maxWidth: '260px' }}>
            Pick a chat, group, channel or community on the left to start.
          </p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    const val = inputText.trim();
    if (!val) return;
    onSendMessage(val, replyTo || undefined);
    setInputText('');
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleReplyClick = (m: ChatMessage) => {
    const quote = m.type === 'text' ? m.text : `a ${m.type} message`;
    setReplyTo(quote || '');
  };

  const renderTick = (status?: MessageStatus) => {
    if (status === 'read') {
      return (
        <svg width="13" height="9" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M1 5.5L4.5 9L11 1.5" />
          <path d="M5.5 5.5L9 9L15.5 1.5" />
        </svg>
      );
    }
    return (
      <svg width="10" height="9" viewBox="0 0 12 11" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M1 5.5L4.5 9L11 1.5" />
      </svg>
    );
  };

  const waveBars = () => {
    const bars = [];
    for (let i = 0; i < 22; i++) {
      const h = 6 + Math.round(Math.sin(i * 0.9) * 6) + 6;
      bars.push(<span key={i} style={{ height: `${h}px` }} />);
    }
    return bars;
  };

  const renderBubbleContent = (m: ChatMessage, msgIdx: number) => {
    if (m.type === 'text') {
      if (m.isTranslating) {
        return (
          <div className="txt">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.9 }}>
              <span className="translating-spinner" /> Translating with Google ML Kit...
            </div>
          </div>
        );
      }

      if (m.translatedText) {
        const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === (m.translatedLang || targetLang));
        const contentToShow = m.showOriginal ? m.text : m.translatedText;

        return (
          <div className="txt-translated-wrap" style={{ minWidth: '160px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--accent-1)',
                marginBottom: '5px',
                paddingBottom: '3px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🌐</span>
                <span>{m.translationEngine || 'Google ML Kit'}</span>
                <span style={{ opacity: 0.8 }}>• {activeLangObj?.flag} {activeLangObj?.name}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOriginalMessage?.(msgIdx);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-1)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {m.showOriginal ? 'Show Translation' : 'Show Original'}
              </button>
            </div>
            <div className="txt">{contentToShow}</div>
          </div>
        );
      }

      return <div className="txt">{m.text}</div>;
    }
    if (m.type === 'sticker') {
      if (m.stickerData) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
              }}
            >
              <LottiePlayer
                src={m.stickerData.lottieUrl}
                fallbackSvg={m.stickerData.animatedSvg}
                loop={true}
                autoplay={true}
              />
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: 600, opacity: 0.8, marginTop: '2px', color: 'var(--text-0)' }}>
              {m.stickerData.name}
            </span>
          </div>
        );
      }
      return <div className="txt" style={{ fontSize: '52px' }}>{m.emoji}</div>;
    }
    if (m.type === 'doc') {
      return (
        <div className="doc-card">
          <div className="doc-ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <div>
            <div className="doc-name">{m.name}</div>
            <div className="doc-sub">{m.size}</div>
          </div>
        </div>
      );
    }
    if (m.type === 'voice') {
      return (
        <div className="voice-bubble">
          <div className="voice-play">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div className="voice-wave">{waveBars()}</div>
          <span style={{ fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace" }}>{m.dur}</span>
        </div>
      );
    }
    if (m.type === 'location') {
      return (
        <div className="loc-card">
          <div className="doc-ic" style={{ background: 'var(--warm)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="doc-name">{m.label}</div>
        </div>
      );
    }
    if (m.type === 'contact') {
      return (
        <div className="contact-card">
          <div className="doc-ic" style={{ background: 'var(--accent-2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="doc-name">{m.cname}</div>
            <div className="doc-sub">{m.cphone}</div>
          </div>
        </div>
      );
    }
    if (m.type === 'poll') {
      return (
        <div className="poll-card" style={{ flexDirection: 'column', alignItems: 'flex-start', minWidth: '230px' }}>
          <div className="doc-name" style={{ marginBottom: '6px' }}>
            📊 {m.question}
          </div>
          {m.options?.map((o, idx) => (
            <div key={idx} className="poll-opt" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{o[0]}</span>
                <span>{o[1]}%</span>
              </div>
              <div className="poll-bar" style={{ width: `${o[1]}%` }} />
            </div>
          ))}
        </div>
      );
    }
    if (m.type === 'sketch') {
      return <div className="img-bubble">✏️ Sketch attachment</div>;
    }
    return null;
  };

  const statusText = activeRoom.online
    ? getUIText('online', interfaceLang)
    : activeRoom.members
    ? `${activeRoom.members} members`
    : activeRoom.subs
    ? `${activeRoom.subs} subscribers`
    : getUIText('offline', interfaceLang);

  const attachTypes = [
    { k: 'photo', label: 'Photo', ic: '📷', color: 'var(--accent-2)' },
    { k: 'doc', label: 'Document', ic: '📄', color: '#6C8CFF' },
    { k: 'poll', label: 'Poll', ic: '📊', color: '#FF9A6F' },
    { k: 'location', label: 'Location', ic: '📍', color: 'var(--warm)' },
    { k: 'contact', label: 'Contact', ic: '👤', color: '#7FD9A6' },
    { k: 'sketch', label: 'Sketch', ic: '✏️', color: '#B388FF' },
    { k: 'sticker', label: 'Sticker', ic: '🎉', color: '#FFD36F' },
    { k: 'zip', label: 'ZIP/RAR', ic: '🗜️', color: '#8FA0B8' },
  ] as const;

  return (
    <div className={`main-panel ${isHiddenOnMobile ? 'hide' : ''}`}>
      <div className="chat-header">
        <div className="mobile-back icon-btn" onClick={onBackMobile} title="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>

        <CachedAvatar
          src={activeRoom.avatar}
          name={activeRoom.name}
          size={42}
          onClick={onOpenProfile}
        />

        <div style={{ cursor: 'pointer' }} onClick={onOpenProfile} title={`View ${activeRoom.name}'s profile`}>
          <div className="li-name">{activeRoom.name}</div>
          <div className="status">{statusText}</div>
        </div>

        <div className="header-actions" style={{ position: 'relative' }}>
          <div className="icon-btn" title="Voice call" onClick={() => onToast(`Voice call with ${activeRoom.name}`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <div className="icon-btn" title="Video call" onClick={() => onToast(`Video call with ${activeRoom.name}`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
          </div>
          <div className="icon-btn" onClick={onOpenProfile} title="Info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>

          {/* 3-Dots Context Menu Trigger */}
          <div
            className={`icon-btn ${showContextMenu ? 'active' : ''}`}
            onClick={() => setShowContextMenu((prev) => !prev)}
            title="More Options"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Context Dropdown Menu */}
          {showContextMenu && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '230px',
                background: 'var(--bg-1, #111b21)',
                borderRadius: '12px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* CHANNEL CONTEXT MENU */}
              {activeRoom.type === 'channel' ? (
                <>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      onOpenProfile();
                      setShowContextMenu(false);
                    }}
                  >
                    <span>📢 Channel info</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://wa.me/channel/${activeRoom.id}`);
                      onToast('Channel invite link copied to clipboard!');
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🔗 Share</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      if (onMuteRoom) onMuteRoom(activeRoom.muted ? 'Off' : 'Always');
                      else onToast(activeRoom.muted ? 'Channel unmuted' : 'Channel muted');
                      setShowContextMenu(false);
                    }}
                  >
                    <span>{activeRoom.muted ? '🔔 Unmute' : '🔕 Mute'}</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowUnfollowPrompt(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🚪 Unfollow</span>
                  </button>
                  <button
                    className="context-menu-item danger"
                    onClick={() => {
                      setShowMoreModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>⚠️ Report</span>
                  </button>
                </>
              ) : activeRoom.type === 'group' ? (
                /* GROUP CHAT CONTEXT MENU */
                <>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      onOpenProfile();
                      setShowContextMenu(false);
                    }}
                  >
                    <span>👥 Group info</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowSharedMediaModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>📁 Group media</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowSearchOverlay(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🔍 Search</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowMuteModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🔕 Mute notifications</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowDisappearingModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>⏳ Disappearing messages</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowWallpaperModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🖼️ Wallpaper</span>
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowMoreModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>➕ More ›</span>
                  </button>
                </>
              ) : (
                /* 1-ON-1 CHAT CONTEXT MENU */
                <>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      onOpenProfile();
                      setShowContextMenu(false);
                    }}
                  >
                    <span>👤 View contact</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowSharedMediaModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>📁 Media, links, and docs</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowSearchOverlay(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🔍 Search</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowMuteModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🔕 Mute notifications</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowDisappearingModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>⏳ Disappearing messages</span>
                  </button>
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowWallpaperModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>🖼️ Wallpaper</span>
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <button
                    className="context-menu-item"
                    onClick={() => {
                      setShowMoreModal(true);
                      setShowContextMenu(false);
                    }}
                  >
                    <span>➕ More ›</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* In-Chat Real-Time Search Overlay */}
      {showSearchOverlay && (
        <div
          style={{
            padding: '8px 16px',
            background: 'var(--bg-2, #202c33)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder={`Search messages in ${activeRoom.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-1, #111b21)',
              border: '1px solid var(--accent-1, #00A884)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
            autoFocus
          />
          {searchQuery && (
            <span style={{ fontSize: '12px', color: 'var(--accent-1, #00A884)', fontWeight: 600 }}>
              {messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase())).length} matches
            </span>
          )}
          <button
            onClick={() => {
              setShowSearchOverlay(false);
              setSearchQuery('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Viewport with Custom Wallpaper */}
      <div
        className="messages"
        style={{
          background: (activeRoom as any).wallpaper || globalWallpaper || 'radial-gradient(circle at 50% 50%, #0d1e28 0%, #0b141a 100%)',
          position: 'relative',
        }}
      >
        {/* Wallpaper Dimming Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            opacity: ((activeRoom as any).wallpaperDim ?? globalWallpaperDim ?? 20) / 100,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div className="date-divider">
          <svg viewBox="0 0 100 8" preserveAspectRatio="none">
            <path d="M0 4 Q5 0 10 4 T20 4 T30 4 T40 4 T50 4 T60 4 T70 4 T80 4 T90 4 T100 4" stroke="currentColor" fill="none" strokeWidth="1" />
          </svg>
          <span>{messages[0]?.time || 'Today'}</span>
          <svg viewBox="0 0 100 8" preserveAspectRatio="none">
            <path d="M0 4 Q5 0 10 4 T20 4 T30 4 T40 4 T50 4 T60 4 T70 4 T80 4 T90 4 T100 4" stroke="currentColor" fill="none" strokeWidth="1" />
          </svg>
        </div>

        {messages.map((m, i) => {
          const mine = m.from === 'me';
          const isBare = m.type === 'sticker' || m.type === 'sketch';

          return (
            <div key={i} className={`msg-row ${mine ? 'mine' : ''}`} style={{ position: 'relative' }}>
              {!mine && (
                <CachedAvatar
                  src={m.avatar || activeRoom.avatar}
                  name={m.name || activeRoom.name}
                  size={32}
                  onClick={onOpenProfile}
                />
              )}

              <div className="bubble-wrap" style={{ position: 'relative' }}>
                {/* Floating Quick Reaction Bar */}
                {reactionBarMsgIdx === i && (
                  <div className="floating-reaction-bar">
                    {['👍', '❤️', '🔥', '😂', '😮', '😭', '🎉', '🙏'].map((e) => (
                      <button
                        key={e}
                        className="reaction-quick-btn"
                        onClick={() => {
                          onReactMessage(i, e);
                          setReactionBarMsgIdx(null);
                        }}
                      >
                        {e}
                      </button>
                    ))}
                    <button
                      className="reaction-quick-btn more-btn"
                      title="Pick any emoji reaction"
                      onClick={() => {
                        setCustomReactionPickerMsgIdx(customReactionPickerMsgIdx === i ? null : i);
                        setReactionBarMsgIdx(null);
                      }}
                    >
                      ➕
                    </button>
                  </div>
                )}

                {/* Custom Emoji Picker Popover for Reaction */}
                {customReactionPickerMsgIdx === i && (
                  <div className="msg-custom-emoji-popover">
                    <EmojiPicker
                      isOpen={true}
                      onClose={() => setCustomReactionPickerMsgIdx(null)}
                      onSelectStandardEmoji={(emoji) => {
                        onReactMessage(i, emoji);
                        setCustomReactionPickerMsgIdx(null);
                      }}
                      onSendAnimatedSticker={(stk) => {
                        onReactMessage(i, stk.previewEmoji);
                        setCustomReactionPickerMsgIdx(null);
                      }}
                    />
                  </div>
                )}

                <div className="action-bar">
                  <div
                    className="act-btn"
                    title="Translate Message"
                    onClick={() => {
                      if (m.type === 'text') {
                        onTranslateMessage?.(i, targetLang);
                      } else {
                        onToast('Only text messages can be translated');
                      }
                    }}
                  >
                    🌐
                  </div>
                  <div
                    className="act-btn"
                    title="React with Emoji"
                    onClick={() => {
                      setReactionBarMsgIdx(reactionBarMsgIdx === i ? null : i);
                      setCustomReactionPickerMsgIdx(null);
                    }}
                  >
                    😊
                  </div>
                  <div className="act-btn" title="Reply" onClick={() => handleReplyClick(m)}>
                    ↩
                  </div>
                  <div className="act-btn" title="Forward" onClick={() => onToast('Forward — pick a chat to forward this to.')}>
                    ➦
                  </div>
                  <div className="act-btn" title="Copy" onClick={() => onToast('Copied to clipboard')}>
                    ⧉
                  </div>
                  <div className="act-btn" title="Delete" onClick={() => onDeleteMessage(i)}>
                    🗑
                  </div>
                </div>

                <div className={`bubble ${isBare ? 'sticker-bubble' : ''}`}>
                  {m.replyText && <div className="reply-quote">{m.replyText}</div>}
                  {renderBubbleContent(m, i)}
                  {!isBare && (
                    <div className="meta">
                      <span>{m.time}</span>
                      {mine && renderTick(m.status)}
                    </div>
                  )}
                </div>

                {!!m.reactions?.length && (
                  <div className="reactions-row">
                    {m.reactions.map((r, rIdx) => (
                      <div key={rIdx} className="reaction">
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {mine && (
                <div
                  className="avatar round"
                  style={{
                    background: !userAvatarUrl ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' : undefined,
                    width: '32px',
                    height: '32px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '1.5px solid var(--accent-1, #00A884)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  }}
                  onClick={onOpenProfile}
                  title="Your profile picture"
                >
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    userInitials || 'YOU'
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="typing-row">
            <span />
            <span />
            <span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="composer">
        {showAttachMenu && (
          <div className="attach-menu">
            {attachTypes.map((a) => (
              <div
                key={a.k}
                className="attach-opt"
                onClick={() => {
                  onSendAttachment(a.k);
                  setShowAttachMenu(false);
                }}
              >
                <div className="ic" style={{ background: a.color, fontSize: '16px' }}>
                  {a.ic}
                </div>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        )}

        <EmojiPicker
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectStandardEmoji={(emoji) => {
            setInputText((prev) => prev + emoji);
          }}
          onSendAnimatedSticker={(stk) => {
            if (onSendSticker) {
              onSendSticker(stk);
            } else {
              onSendAttachment('sticker');
            }
            setShowEmojiPicker(false);
            onToast(`Sent ${stk.name} sticker! 🚀`);
          }}
        />

        {replyTo && (
          <div className="reply-preview show">
            <span>Replying to: {replyTo}</span>
            <span style={{ cursor: 'pointer', color: 'var(--text-1)' }} onClick={() => setReplyTo(null)}>
              ✕
            </span>
          </div>
        )}

        <div className="composer-row">
          <div
            className="icon-btn"
            onClick={() => {
              setShowAttachMenu((prev) => !prev);
              setShowEmojiPicker(false);
            }}
            title="Attach File"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </div>

          <input
            placeholder={getUIText('typeMessage', interfaceLang)}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div
            className={`icon-btn ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => {
              setShowEmojiPicker((prev) => !prev);
              setShowAttachMenu(false);
            }}
            title="Emoji & Animated Stickers"
            style={{ color: showEmojiPicker ? 'var(--accent-1)' : undefined }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </div>

          <div className="send-btn" onClick={handleSend} title="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Modals & Sheets */}
      {showWallpaperModal && (
        <WallpaperPickerModal
          roomName={activeRoom.name}
          currentBg={(activeRoom as any).wallpaper || globalWallpaper}
          currentDim={(activeRoom as any).wallpaperDim ?? globalWallpaperDim}
          onApplyWallpaper={(bg, dim, applyAll) => {
            if (onApplyWallpaper) onApplyWallpaper(bg, dim, applyAll);
            onToast(applyAll ? 'Set as default wallpaper for all chats!' : `Wallpaper updated for ${activeRoom.name}`);
          }}
          onClose={() => setShowWallpaperModal(false)}
          onToast={onToast}
        />
      )}

      {showSharedMediaModal && (
        <SharedMediaModal
          roomName={activeRoom.name}
          messages={messages}
          onClose={() => setShowSharedMediaModal(false)}
          onToast={onToast}
        />
      )}

      {showMuteModal && (
        <MutePickerModal
          roomName={activeRoom.name}
          onConfirmMute={(duration, showNotifs) => {
            if (onMuteRoom) onMuteRoom(duration);
            onToast(`Muted ${activeRoom.name} for ${duration}${showNotifs ? ' (Notifications silent)' : ''}`);
          }}
          onClose={() => setShowMuteModal(false)}
        />
      )}

      {showDisappearingModal && (
        <DisappearingMessagesModal
          roomName={activeRoom.name}
          currentTimer={(activeRoom as any).disappearingTimer || 'Off'}
          onConfirm={(timer) => {
            if (onSetDisappearingTimer) onSetDisappearingTimer(timer);
            onToast(timer === 'Off' ? 'Disappearing messages turned off' : `Disappearing messages set to ${timer}`);
          }}
          onClose={() => setShowDisappearingModal(false)}
        />
      )}

      {showMoreModal && (
        <MoreActionsModal
          room={activeRoom}
          messages={messages}
          onReport={() => onToast(`Reported ${activeRoom.name} to moderation.`)}
          onBlock={() => {
            if (onBlockUser) onBlockUser();
            onToast(`Blocked ${activeRoom.name}`);
          }}
          onExitGroup={() => {
            if (onExitGroup) onExitGroup();
            onToast(`Left ${activeRoom.name}`);
          }}
          onClearChat={() => {
            if (onClearChat) onClearChat();
            onToast(`Cleared chat history for ${activeRoom.name}`);
          }}
          onExportChat={() => {
            const text = messages.map((m) => `[${m.time}] ${m.from === 'me' ? 'YOU' : activeRoom.name}: ${m.text || m.type}`).join('\n');
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Chat_Archive_${activeRoom.name.replace(/\s+/g, '_')}.txt`;
            a.click();
            onToast(`Exported conversation log to text file!`);
          }}
          onAddShortcut={() => onToast(`Shortcut for "${activeRoom.name}" added to Home Screen!`)}
          onClose={() => setShowMoreModal(false)}
        />
      )}

      {/* Unfollow Channel Prompt */}
      {showUnfollowPrompt && (
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
          onClick={() => setShowUnfollowPrompt(false)}
        >
          <div
            style={{
              width: '360px',
              maxWidth: '90vw',
              background: 'var(--bg-1, #111b21)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#FF5376' }}>
              🚪 Unfollow "{activeRoom.name}"?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '20px' }}>
              You can always follow this channel again anytime from the Updates tab.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowUnfollowPrompt(false)}
                style={{ padding: '8px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onUnfollowChannel) onUnfollowChannel();
                  onToast(`Unfollowed ${activeRoom.name}`);
                  setShowUnfollowPrompt(false);
                }}
                style={{ padding: '8px 18px', background: '#FF5376', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '8px', cursor: 'pointer' }}
              >
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
