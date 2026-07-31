import React, { useState, useRef } from 'react';
import { ChatMessage, MessageStatus } from '../types';
import { CachedAvatar } from './CachedAvatar';
import { LottiePlayer } from './LottiePlayer';

interface TelegramMessageBubbleProps {
  message: ChatMessage;
  msgIndex: number;
  mine: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  showSenderName?: boolean;
  targetLang?: string;
  isSearchMatch?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelect?: (index: number) => void;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage, index: number) => void;
  onDelete?: (index: number) => void;
  onForward?: (message: ChatMessage) => void;
  onPin?: (message: ChatMessage, index: number) => void;
  onReact?: (index: number, emoji: string) => void;
  onTranslate?: (index: number) => void;
  onToggleOriginal?: (index: number) => void;
  onJumpToReply?: (replyMessageId?: string, replyText?: string) => void;
  onOpenMediaLightbox?: (mediaUrl: string, type: 'photo' | 'video') => void;
  onToast: (text: string) => void;
  onContextMenuOpen?: (e: React.MouseEvent | React.TouchEvent, index: number) => void;
  onVotePoll?: (index: number, optionIdx: number) => void;
}

// Telegram username colors for group chats
const TELEGRAM_NAME_COLORS = [
  '#e542a3', // Pink
  '#30a2f5', // Blue
  '#35c453', // Green
  '#f39c12', // Orange
  '#a262e8', // Purple
  '#e74c3c', // Red
  '#1abc9c', // Teal
];

function getNameColor(name: string = ''): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % TELEGRAM_NAME_COLORS.length;
  return TELEGRAM_NAME_COLORS[idx];
}

// Helper to check if string is only 1-3 emojis
function isEmojiOnly(str?: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]){1,3}$/gi;
  return emojiRegex.test(trimmed);
}

// Simple text parser for bold, italic, code, URLs, mentions, and hashtags
function parseFormattedText(text: string) {
  if (!text) return null;

  // Split by URLs, @mentions, #hashtags, markdown bold/italic
  const tokenRegex = /(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+|#[a-zA-Z0-9_]+|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="tg-link"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }

    if (part.startsWith('@')) {
      return (
        <span key={idx} className="tg-mention">
          {part}
        </span>
      );
    }

    if (part.startsWith('#')) {
      return (
        <span key={idx} className="tg-hashtag">
          {part}
        </span>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="tg-inline-code">{part.slice(1, -1)}</code>;
    }

    return <span key={idx}>{part}</span>;
  });
}

export const TelegramMessageBubble: React.FC<TelegramMessageBubbleProps> = ({
  message,
  msgIndex,
  mine,
  isFirstInGroup = true,
  isLastInGroup = true,
  showSenderName = false,
  targetLang = 'en',
  isSearchMatch = false,
  isSelected = false,
  isSelectionMode = false,
  onToggleSelect,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onPin,
  onReact,
  onTranslate,
  onToggleOriginal,
  onJumpToReply,
  onOpenMediaLightbox,
  onToast,
  onContextMenuOpen,
  onVotePoll,
}) => {
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<'1x' | '1.5x' | '2x'>('1x');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  // Status Ticks
  const renderStatusTicks = (status?: MessageStatus) => {
    if (!mine) return null;

    if (status === 'sending') {
      return (
        <span className="tg-status-icon sending" title="Sending...">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        </span>
      );
    }

    if (status === 'failed') {
      return (
        <span className="tg-status-icon failed" title="Failed to send. Click to retry." onClick={() => onToast('Retrying sending message...')}>
          ⚠️
        </span>
      );
    }

    if (status === 'read') {
      return (
        <span className="tg-status-icon read" title="Read">
          <svg width="15" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M1 5.5L4.5 9L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 5.5L9 9L15.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    }

    if (status === 'delivered') {
      return (
        <span className="tg-status-icon delivered" title="Delivered">
          <svg width="15" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M1 5.5L4.5 9L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 5.5L9 9L15.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    }

    // Default 'sent' (Single tick)
    return (
      <span className="tg-status-icon sent" title="Sent">
        <svg width="11" height="11" viewBox="0 0 12 11" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M1 5.5L4.5 9L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  };

  // Touch Swipe to Reply Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSelectionMode) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || isSelectionMode) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    if (diffX > 0 && diffX < 80) {
      setSwipeOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 45 && onReply) {
      onReply(message);
    }
    setSwipeOffset(0);
    touchStartXRef.current = null;
  };

  // Handle System Messages
  if (message.type === 'system') {
    return (
      <div className="tg-system-row">
        <div className="tg-system-pill">
          {message.text}
        </div>
      </div>
    );
  }

  // Handle Sticker Messages (Transparent backdrop)
  const isSticker = message.type === 'sticker';
  const isEmojiOnlyMsg = message.type === 'text' && isEmojiOnly(message.text);

  return (
    <div
      className={`tg-msg-row ${mine ? 'outgoing' : 'incoming'} ${isFirstInGroup ? 'group-first' : ''} ${
        isLastInGroup ? 'group-last' : ''
      } ${isSearchMatch ? 'search-match-flash' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
        transition: swipeOffset === 0 ? 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        if (onContextMenuOpen) {
          e.preventDefault();
          onContextMenuOpen(e, msgIndex);
        }
      }}
    >
      {/* Swipe Reply Trigger Indicator */}
      {swipeOffset > 20 && (
        <div className="tg-swipe-reply-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 9h11a5 5 0 015 5v3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Checkbox in selection mode */}
      {isSelectionMode && (
        <div
          className={`tg-select-checkbox ${isSelected ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(msgIndex);
          }}
        >
          {isSelected && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 5L4.5 8.5L11 1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      )}

      {/* Avatar for Incoming Messages */}
      {!mine && (
        <div className="tg-avatar-cell">
          {isLastInGroup ? (
            <CachedAvatar
              src={message.avatar}
              name={message.senderName || message.name || 'User'}
              size={34}
            />
          ) : (
            <div style={{ width: 34 }} />
          )}
        </div>
      )}

      {/* Main Bubble Container */}
      <div className={`tg-bubble-container ${isSticker || isEmojiOnlyMsg ? 'bare-bubble' : ''}`}>
        <div
          className={`tg-bubble ${mine ? 'out-bubble' : 'in-bubble'} ${
            isLastInGroup && !isSticker && !isEmojiOnlyMsg ? 'has-tail' : ''
          }`}
        >
          {/* SVG Tail on bottom corner of last message in consecutive group */}
          {isLastInGroup && !isSticker && !isEmojiOnlyMsg && (
            <div className={`tg-bubble-tail ${mine ? 'out-tail' : 'in-tail'}`}>
              <svg width="11" height="18" viewBox="0 0 11 18" fill="currentColor">
                {mine ? (
                  <path d="M0 0V18C2.5 18 6 17 9.5 13.5C11 12 11 10.5 11 9C11 5 7 0 0 0Z" />
                ) : (
                  <path d="M11 0V18C8.5 18 5 17 1.5 13.5C0 12 0 10.5 0 9C0 5 4 0 11 0Z" />
                )}
              </svg>
            </div>
          )}

          {/* Forwarded Header */}
          {message.forwardedFrom && (
            <div className="tg-forwarded-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 5l7 7-7 7M20 12H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Forwarded from <strong>{message.forwardedFrom}</strong></span>
            </div>
          )}

          {/* Group Chat Sender Name */}
          {!mine && showSenderName && (
            <div
              className="tg-sender-name"
              style={{ color: message.senderColor || getNameColor(message.senderName || message.name) }}
            >
              {message.senderName || message.name || 'Group Member'}
            </div>
          )}

          {/* Reply Quote Preview */}
          {message.replyText && (
            <div
              className="tg-reply-box"
              onClick={() => onJumpToReply?.(message.replyMessageId, message.replyText)}
            >
              <div className="tg-reply-bar" />
              <div className="tg-reply-content">
                <div className="tg-reply-sender">
                  {message.replySenderName || (mine ? 'You' : message.senderName || 'User')}
                </div>
                <div className="tg-reply-text">{message.replyText}</div>
              </div>
            </div>
          )}

          {/* MESSAGE CONTENT HANDLERS BY TYPE */}

          {/* 1. TEXT MESSAGE */}
          {message.type === 'text' && (
            <div className={`tg-text-content ${isEmojiOnlyMsg ? 'giant-emoji' : ''}`}>
              {message.isTranslating ? (
                <div className="tg-translating-state">
                  <span className="tg-spinner" /> Translating message...
                </div>
              ) : message.translatedText ? (
                <div className="tg-translated-wrap">
                  <div className="tg-translated-meta">
                    <span>🌐 Translated ({message.translatedLang || targetLang})</span>
                    <button onClick={() => onToggleOriginal?.(msgIndex)}>
                      {message.showOriginal ? 'Show Translation' : 'Show Original'}
                    </button>
                  </div>
                  <div className="tg-text-body">
                    {parseFormattedText(message.showOriginal ? message.text || '' : message.translatedText)}
                  </div>
                </div>
              ) : (
                <div className="tg-text-body">
                  {parseFormattedText(message.text || '')}
                </div>
              )}
            </div>
          )}

          {/* 2. PHOTO MESSAGE */}
          {(message.type === 'photo' || message.mediaUrl) && message.type !== 'video' && message.type !== 'video_note' && (
            <div className="tg-media-photo-card">
              <div
                className="tg-photo-wrap"
                onClick={() => onOpenMediaLightbox?.(message.mediaUrl || message.text || '', 'photo')}
              >
                <img
                  src={message.mediaUrl || message.text}
                  alt={message.name || 'Photo'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="tg-photo-img"
                />
              </div>
              {message.name && message.type !== 'text' && (
                <div className="tg-caption">{message.name}</div>
              )}
            </div>
          )}

          {/* 3. VIDEO MESSAGE */}
          {message.type === 'video' && (
            <div className="tg-media-video-card">
              <div
                className="tg-video-wrap"
                onClick={() => onOpenMediaLightbox?.(message.mediaUrl || '', 'video')}
              >
                <video src={message.mediaUrl} className="tg-video-thumb" preload="metadata" />
                <div className="tg-play-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {message.dur && <span className="tg-video-dur">{message.dur}</span>}
              </div>
              {message.name && <div className="tg-caption">{message.name}</div>}
            </div>
          )}

          {/* 4. VIDEO NOTE (ROUND VIDEO BUBBLE) */}
          {message.type === 'video_note' && (
            <div className="tg-video-note-wrap">
              <div className="tg-video-note-circle">
                <video src={message.mediaUrl} autoPlay loop muted playsInline className="tg-video-note-element" />
                <div className="tg-video-note-ring" />
              </div>
              {message.dur && <span className="tg-video-note-dur">{message.dur}</span>}
            </div>
          )}

          {/* 5. VOICE MESSAGE */}
          {message.type === 'voice' && (
            <div className="tg-voice-card">
              <button
                className={`tg-voice-play-btn ${voicePlaying ? 'playing' : ''}`}
                onClick={() => {
                  setVoicePlaying(!voicePlaying);
                  onToast(voicePlaying ? 'Paused voice note' : 'Playing voice note 🎧');
                }}
              >
                {voicePlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="tg-voice-body">
                <div className="tg-voice-waveform">
                  {[12, 18, 8, 24, 16, 30, 20, 10, 26, 14, 28, 12, 22, 18, 8, 24, 16, 10].map((h, i) => (
                    <span
                      key={i}
                      className={`tg-wave-bar ${i < 6 && voicePlaying ? 'active' : ''}`}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <div className="tg-voice-meta">
                  <span className="tg-voice-dur">{message.dur || '0:18'}</span>
                  <button
                    className="tg-speed-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = voiceSpeed === '1x' ? '1.5x' : voiceSpeed === '1.5x' ? '2x' : '1x';
                      setVoiceSpeed(next);
                      onToast(`Playback speed: ${next}`);
                    }}
                  >
                    {voiceSpeed}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. AUDIO / MUSIC FILE */}
          {message.type === 'audio' && (
            <div className="tg-audio-card">
              <div className="tg-audio-ic">🎵</div>
              <div className="tg-audio-info">
                <div className="tg-audio-title">{message.name || 'Audio Track'}</div>
                <div className="tg-audio-sub">{message.size || '3.4 MB'} • {message.dur || '3:20'}</div>
              </div>
            </div>
          )}

          {/* 7. DOCUMENT / FILE */}
          {message.type === 'doc' && (
            <div className="tg-doc-card">
              <div className="tg-doc-ic">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="tg-doc-info">
                <div className="tg-doc-name">{message.name || 'Document.pdf'}</div>
                <div className="tg-doc-size">{message.size || '1.2 MB'}</div>
              </div>
              <button className="tg-doc-download" onClick={() => onToast(`Downloading ${message.name || 'file'}...`)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
            </div>
          )}

          {/* 8. INTERACTIVE POLL / QUIZ */}
          {message.type === 'poll' && (
            <div className="tg-poll-card">
              <div className="tg-poll-type">
                📊 {message.isQuiz ? 'Quiz' : 'Anonymous Poll'}
              </div>
              <div className="tg-poll-question">{message.question || 'Select an option:'}</div>

              <div className="tg-poll-options">
                {message.options?.map((opt, optIdx) => {
                  const label = opt[0];
                  const percent = opt[1];
                  const isVoted = message.userVotedOption === optIdx;

                  return (
                    <div
                      key={optIdx}
                      className={`tg-poll-opt ${isVoted ? 'voted' : ''}`}
                      onClick={() => onVotePoll?.(msgIndex, optIdx)}
                    >
                      <div className="tg-poll-opt-top">
                        <span className="tg-poll-opt-label">
                          <span className={`tg-radio-dot ${isVoted ? 'selected' : ''}`} />
                          {label}
                        </span>
                        <span className="tg-poll-opt-pct">{percent}%</span>
                      </div>
                      <div className="tg-poll-bar-bg">
                        <div className="tg-poll-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="tg-poll-footer">
                <span>{message.totalVotes || 42} votes</span>
                <span>• Live results</span>
              </div>
            </div>
          )}

          {/* 9. CONTACT CARD */}
          {message.type === 'contact' && (
            <div className="tg-contact-card">
              <div className="tg-contact-top">
                <CachedAvatar name={message.cname || 'Contact'} size={40} />
                <div className="tg-contact-info">
                  <div className="tg-contact-name">{message.cname || 'Contact Name'}</div>
                  <div className="tg-contact-phone">{message.cphone || '+256 700 000000'}</div>
                </div>
              </div>
              <div className="tg-contact-actions">
                <button onClick={() => onToast(`Messaging ${message.cname}`)}>Message</button>
                <button onClick={() => onToast(`Saved ${message.cname} to Contacts!`)}>Add Contact</button>
              </div>
            </div>
          )}

          {/* 10. LOCATION MESSAGE */}
          {message.type === 'location' && (
            <div className="tg-location-card">
              <div className="tg-location-map-preview">
                <div className="tg-map-pin">📍</div>
                <div className="tg-map-grid" />
                <span className="tg-live-dot" />
              </div>
              <div className="tg-location-details">
                <div className="tg-location-title">{message.label || 'Shared Location'}</div>
                <div className="tg-location-sub">0.4 km away • Updated live</div>
                <button
                  className="tg-maps-btn"
                  onClick={() => onToast(`Opening location in Google Maps...`)}
                >
                  Open in Maps
                </button>
              </div>
            </div>
          )}

          {/* 11. STICKER MESSAGE */}
          {message.type === 'sticker' && (
            <div className="tg-sticker-card">
              {message.stickerData ? (
                <div className="tg-sticker-lottie">
                  <LottiePlayer
                    src={message.stickerData.lottieUrl}
                    fallbackSvg={message.stickerData.animatedSvg}
                    loop={true}
                    autoplay={true}
                  />
                </div>
              ) : (
                <div className="tg-sticker-emoji">{message.emoji || '🎉'}</div>
              )}
            </div>
          )}

          {/* METADATA FOOTER (TIMESTAMP, EDIT BADGE, PINNED, STATUS TICKS) */}
          {!isSticker && !isEmojiOnlyMsg && (
            <div className="tg-msg-meta">
              {message.isPinned && <span className="tg-pinned-badge" title="Pinned">📌</span>}
              {message.isEdited && <span className="tg-edited-tag">edited</span>}
              <span className="tg-time">{message.time}</span>
              {mine && renderStatusTicks(message.status)}
            </div>
          )}
        </div>

        {/* REACTIONS ROW BELOW BUBBLE */}
        {!!message.reactions?.length && (
          <div className="tg-reactions-row">
            {message.reactions.map((r, rIdx) => {
              const emoji = typeof r === 'string' ? r : r.emoji;
              const count = typeof r === 'string' ? 1 : r.count;
              const userReacted = typeof r === 'string' ? false : r.userReacted;

              return (
                <button
                  key={rIdx}
                  className={`tg-reaction-chip ${userReacted ? 'active' : ''}`}
                  onClick={() => onReact?.(msgIndex, emoji)}
                >
                  <span>{emoji}</span>
                  {count > 1 && <span className="count">{count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
