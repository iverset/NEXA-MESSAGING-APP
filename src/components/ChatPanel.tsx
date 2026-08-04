import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatRoom, MessageStatus } from '../types';
import { EmojiPicker, AnimatedStickerItem } from './EmojiPicker';
import { LottiePlayer } from './LottiePlayer';
import { SUPPORTED_LANGUAGES, getUIText } from '../services/translator';
import { WallpaperPickerModal } from './WallpaperPickerModal';
import { SharedMediaModal } from './SharedMediaModal';
import { MediaLightboxModal } from './MediaLightboxModal';
import { MutePickerModal } from './MutePickerModal';
import { DisappearingMessagesModal } from './DisappearingMessagesModal';
import { MoreActionsModal } from './MoreActionsModal';
import { PinnedMessagesModal } from './PinnedMessagesModal';
import { MessageInfoModal } from './MessageInfoModal';
import { CachedAvatar } from './CachedAvatar';
import { TelegramMessageBubble } from './TelegramMessageBubble';

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

export const ChatPanel: React.FC<ChatPanelProps> = ({
  activeRoom,
  messages,
  isTyping,
  targetLang = 'en',
  interfaceLang = 'en',
  userAvatarUrl,
  userInitials = 'YOU',
  globalWallpaper,
  globalWallpaperDim = 0,
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
  // Input & Messaging States
  const [inputText, setInputText] = useState('');
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Local Chat Messages (allows real-time state mutations for edits/polls/reactions/pins)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  // Context Menu & Multi-Select States
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    msgIndex: number;
  } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Search in Chat States
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'media' | 'doc' | 'voice' | 'link' | 'pinned'>('all');
  const [matchIndices, setMatchIndices] = useState<number[]>([]);
  const [currentMatchPointer, setCurrentMatchPointer] = useState<number>(0);

  // Lightbox & Modal States
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'photo' | 'video' } | null>(null);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showSharedMediaModal, setShowSharedMediaModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState<ChatMessage | null>(null);

  // Keyboard Shortcuts (Cmd+F / Ctrl+F for search, Esc for close)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearchOverlay((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (showSearchOverlay) setShowSearchOverlay(false);
        if (showPinnedModal) setShowPinnedModal(false);
        if (infoMessage) setInfoMessage(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showSearchOverlay, showPinnedModal, infoMessage]);

  // Voice Recording & File Upload States
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingLocked, setIsRecordingLocked] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRecording && !isRecordingPaused) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording, isRecordingPaused]);

  const handleStartVoiceRecording = () => {
    setIsRecording(true);
    setIsRecordingLocked(false);
    setIsRecordingPaused(false);
    setRecordingSeconds(0);
    onToast('Voice recording started 🎙️');
  };

  const handleCancelVoiceRecording = () => {
    setIsRecording(false);
    setIsRecordingLocked(false);
    setIsRecordingPaused(false);
    setRecordingSeconds(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    onToast('Recording cancelled');
  };

  const handleSendVoiceRecording = () => {
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    onSendMessage(`🎤 Voice Message (${durStr || '0:03'})`, replyMessage ? replyMessage.text || replyMessage.type : undefined);
    setIsRecording(false);
    setIsRecordingLocked(false);
    setIsRecordingPaused(false);
    setRecordingSeconds(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (replyMessage) setReplyMessage(null);
  };

  const handleNativeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        onSendAttachment('photo');
      } else {
        onSendAttachment('doc');
      }
      onToast(`Attached file: ${file.name}`);
    }
    if (e.target) e.target.value = '';
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length, isTyping]);

  // Find latest pinned message
  const pinnedMsg = chatMessages.slice().reverse().find((m) => m.isPinned);

  // Update In-Chat Search Matches
  useEffect(() => {
    if (!searchQuery.trim() && searchFilter === 'all') {
      setMatchIndices([]);
      setCurrentMatchPointer(0);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches: number[] = [];
    chatMessages.forEach((m, idx) => {
      const textMatches = !query || (m.text && m.text.toLowerCase().includes(query)) || (m.name && m.name.toLowerCase().includes(query));
      let typeMatches = true;
      if (searchFilter === 'media') typeMatches = m.type === 'photo' || m.type === 'video' || m.type === 'video_note';
      else if (searchFilter === 'doc') typeMatches = m.type === 'doc';
      else if (searchFilter === 'voice') typeMatches = m.type === 'voice' || m.type === 'audio';
      else if (searchFilter === 'link') typeMatches = !!(m.text && (m.text.includes('http://') || m.text.includes('https://')));
      else if (searchFilter === 'pinned') typeMatches = !!m.isPinned;

      if (textMatches && typeMatches) {
        matches.push(idx);
      }
    });
    setMatchIndices(matches);
    setCurrentMatchPointer(matches.length > 0 ? matches.length - 1 : 0);

    if (matches.length > 0) {
      const targetIndex = matches[matches.length - 1];
      messageRefs.current[targetIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchQuery, searchFilter, chatMessages]);

  const handleNextSearchMatch = (direction: 'up' | 'down') => {
    if (matchIndices.length === 0) return;
    let nextPtr = direction === 'up' ? currentMatchPointer - 1 : currentMatchPointer + 1;
    if (nextPtr < 0) nextPtr = matchIndices.length - 1;
    if (nextPtr >= matchIndices.length) nextPtr = 0;
    setCurrentMatchPointer(nextPtr);
    const targetIdx = matchIndices[nextPtr];
    messageRefs.current[targetIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
            gap: '12px',
            color: 'var(--text-1)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div className="logo" style={{ width: '64px', height: '64px' }}>
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
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-0)' }}>
            NEXA Telegram Messaging
          </p>
          <p style={{ fontSize: '13px', maxWidth: '280px', opacity: 0.8 }}>
            Select a conversation from the sidebar to open the chat stream.
          </p>
        </div>
      </div>
    );
  }

  // Handle Sending or Editing Message
  const handleSend = () => {
    const val = inputText.trim();
    if (!val) return;

    if (editingIndex !== null) {
      // Edit existing message
      setChatMessages((prev) =>
        prev.map((m, idx) => (idx === editingIndex ? { ...m, text: val, isEdited: true } : m))
      );
      setEditingIndex(null);
      setInputText('');
      onToast('Message edited');
      return;
    }

    // New Message
    const quote = replyMessage
      ? replyMessage.type === 'text'
        ? replyMessage.text
        : `[${replyMessage.type}]`
      : undefined;

    onSendMessage(val, quote);
    setInputText('');
    setReplyMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Context Menu Actions
  const handleOpenContextMenu = (e: React.MouseEvent | React.TouchEvent, msgIndex: number) => {
    let clientX = 0;
    let clientY = 0;

    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Clamp coordinates within window
    const menuWidth = 220;
    const menuHeight = 320;
    const x = Math.min(clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ visible: true, x, y, msgIndex });
  };

  const handleContextMenuReply = () => {
    if (!contextMenu) return;
    const msg = chatMessages[contextMenu.msgIndex];
    setReplyMessage(msg);
    setContextMenu(null);
  };

  const handleContextMenuCopy = () => {
    if (!contextMenu) return;
    const msg = chatMessages[contextMenu.msgIndex];
    if (msg.text) {
      navigator.clipboard.writeText(msg.text);
      onToast('Copied text to clipboard 📋');
    }
    setContextMenu(null);
  };

  const handleContextMenuEdit = () => {
    if (!contextMenu) return;
    const msg = chatMessages[contextMenu.msgIndex];
    if (msg.from === 'me' && msg.type === 'text') {
      setEditingIndex(contextMenu.msgIndex);
      setInputText(msg.text || '');
    } else {
      onToast('Only your own text messages can be edited');
    }
    setContextMenu(null);
  };

  const handleContextMenuForward = () => {
    if (!contextMenu) return;
    const msg = chatMessages[contextMenu.msgIndex];
    onToast(`Forwarding message from ${msg.name || 'user'}...`);
    setContextMenu(null);
  };

  const handleContextMenuPin = () => {
    if (!contextMenu) return;
    const idx = contextMenu.msgIndex;
    setChatMessages((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, isPinned: !m.isPinned } : m))
    );
    const isNowPinned = !chatMessages[idx].isPinned;
    onToast(isNowPinned ? 'Message pinned 📌' : 'Message unpinned');
    setContextMenu(null);
  };

  const handleContextMenuSelect = () => {
    if (!contextMenu) return;
    setIsSelectionMode(true);
    setSelectedIndices(new Set([contextMenu.msgIndex]));
    setContextMenu(null);
  };

  const handleContextMenuTranslate = () => {
    if (!contextMenu) return;
    onTranslateMessage?.(contextMenu.msgIndex, targetLang);
    setContextMenu(null);
  };

  const handleContextMenuDelete = () => {
    if (!contextMenu) return;
    const idx = contextMenu.msgIndex;
    onDeleteMessage(idx);
    setChatMessages((prev) => prev.filter((_, i) => i !== idx));
    onToast('Message deleted');
    setContextMenu(null);
  };

  // Poll voting handler
  const handleVotePoll = (msgIdx: number, optionIdx: number) => {
    setChatMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIdx || !m.options) return m;
        const newOpts = m.options.map((opt, oIdx) => {
          let countPct = opt[1];
          if (oIdx === optionIdx) countPct += 12;
          return [opt[0], Math.min(100, countPct)] as [string, number];
        });
        return {
          ...m,
          options: newOpts,
          userVotedOption: optionIdx,
          totalVotes: (m.totalVotes || 42) + 1,
        };
      })
    );
    onToast('Vote registered! 🗳️');
  };

  // Multi-select handlers
  const handleToggleSelectIndex = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    const indicesToDelete = Array.from(selectedIndices).map((n) => Number(n)).sort((a, b) => b - a);
    indicesToDelete.forEach((idx) => onDeleteMessage(idx));
    setChatMessages((prev) => prev.filter((_, i) => !selectedIndices.has(i)));
    setIsSelectionMode(false);
    setSelectedIndices(new Set());
    onToast(`Deleted ${indicesToDelete.length} messages`);
  };

  // Custom wallpaper background style
  const roomWallpaper = activeRoom.wallpaper || globalWallpaper;
  const roomWallpaperDim = activeRoom.wallpaperDim ?? globalWallpaperDim;

  return (
    <div
      className={`main-panel ${isHiddenOnMobile ? 'hide' : ''}`}
      style={{
        backgroundImage: roomWallpaper ? `url(${roomWallpaper})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Wallpaper Dark Dim Overlay */}
      {roomWallpaper && roomWallpaperDim > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(0, 0, 0, ${roomWallpaperDim / 100})`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* TOP HEADER */}
      <div className="panel-hdr" style={{ zIndex: 10 }}>
        <button
          className="hdr-back-btn desktop-hide"
          onClick={onBackMobile}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-0)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '4px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
          onClick={onOpenProfile}
        >
          <div style={{ position: 'relative' }}>
            <CachedAvatar
              src={activeRoom.avatar}
              name={activeRoom.name}
              size={42}
            />
            {activeRoom.online && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: '#00A884',
                  border: '2px solid var(--bg-1)',
                }}
              />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--text-0)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeRoom.name}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: activeRoom.online ? 'var(--accent-1)' : 'var(--text-1)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {isTyping
                ? 'typing...'
                : activeRoom.type === 'group'
                ? '324 members, 18 online'
                : activeRoom.type === 'channel'
                ? '12.4K subscribers'
                : activeRoom.online
                ? 'online'
                : activeRoom.lastSeen || 'last seen recently'}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="header-actions">
          <button
            className="panel-hdr-ic"
            title="Search in Chat"
            onClick={() => setShowSearchOverlay(!showSearchOverlay)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <button className="panel-hdr-ic" title="Voice Call" onClick={() => onToast('Starting voice call...')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </button>

          <button className="panel-hdr-ic" title="More Options" onClick={() => setShowMoreModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* STICKY PINNED MESSAGE BANNER */}
      {pinnedMsg && (
        <div className="tg-pinned-bar">
          <div
            className="tg-pinned-info"
            onClick={() => {
              const idx = chatMessages.findIndex((m) => m.id === pinnedMsg.id || (m.isPinned && m.text === pinnedMsg.text));
              if (idx !== -1) {
                messageRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                setShowPinnedModal(true);
              }
            }}
            title="Jump to pinned message"
            style={{ flex: 1, cursor: 'pointer' }}
          >
            <span style={{ fontSize: '16px' }}>📌</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-1, #00A884)' }}>Pinned Message</div>
              <div className="tg-pinned-text">{pinnedMsg.text || 'Pinned attachment'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowPinnedModal(true)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="View all pinned messages"
            >
              <span>View All ({chatMessages.filter((m) => m.isPinned).length})</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <button
              onClick={() => {
                const idx = chatMessages.findIndex((m) => m.id === pinnedMsg.id || (m.isPinned && m.text === pinnedMsg.text));
                if (idx !== -1) {
                  setChatMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, isPinned: false } : m)));
                  onToast('Message unpinned');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
              }}
              title="Unpin message"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* IN-CHAT SEARCH OVERLAY */}
      {showSearchOverlay && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--bg-1)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search in chat (Cmd+F / Ctrl+F)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                background: 'var(--bg-2)',
                border: 'none',
                borderRadius: '16px',
                padding: '6px 14px',
                color: 'var(--text-0)',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-1)', minWidth: '60px', textAlign: 'center' }}>
              {matchIndices.length > 0 ? `${currentMatchPointer + 1} of ${matchIndices.length}` : 'No matches'}
            </span>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-0)', cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => handleNextSearchMatch('up')}
              title="Previous Match"
            >
              ▲
            </button>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-0)', cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => handleNextSearchMatch('down')}
              title="Next Match"
            >
              ▼
            </button>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer', padding: '4px 8px' }}
              onClick={() => {
                setShowSearchOverlay(false);
                setSearchQuery('');
                setSearchFilter('all');
              }}
              title="Close Search"
            >
              ✕
            </button>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'media', label: '🖼️ Photos/Video' },
              { id: 'doc', label: '📄 Files' },
              { id: 'voice', label: '🎙️ Voice' },
              { id: 'link', label: '🔗 Links' },
              { id: 'pinned', label: '📌 Pinned' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSearchFilter(f.id as any)}
                style={{
                  background: searchFilter === f.id ? 'var(--accent-1, #00A884)' : 'var(--bg-2, #202c33)',
                  color: searchFilter === f.id ? '#000' : 'var(--text-0, #fff)',
                  fontWeight: searchFilter === f.id ? 700 : 500,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES STREAM AREA */}
      <div className="tg-messages-stream" style={{ zIndex: 2 }}>
        {chatMessages.map((msg, idx) => {
          const mine = msg.from === 'me';
          const prevMsg = chatMessages[idx - 1];
          const nextMsg = chatMessages[idx + 1];

          // Helper to check if two messages belong to the exact same sender
          const isSameSender = (m1?: ChatMessage, m2?: ChatMessage) => {
            if (!m1 || !m2) return false;
            if (m1.type === 'system' || m2.type === 'system') return false;
            if (m1.from !== m2.from) return false;
            if (m1.from === 'me') return true;
            const s1 = m1.senderName || m1.name || m1.avatar || 'user';
            const s2 = m2.senderName || m2.name || m2.avatar || 'user';
            return s1 === s2;
          };

          const isFirstInGroup = !prevMsg || !isSameSender(prevMsg, msg);
          const isLastInGroup = !nextMsg || !isSameSender(nextMsg, msg);
          const isSearchMatch = matchIndices[currentMatchPointer] === idx;

          return (
            <div key={msg.id || idx} ref={(el) => (messageRefs.current[idx] = el)}>
              <TelegramMessageBubble
                message={msg}
                msgIndex={idx}
                mine={mine}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                showSenderName={activeRoom.type === 'group'}
                targetLang={targetLang}
                isSearchMatch={isSearchMatch}
                isSelected={selectedIndices.has(idx)}
                isSelectionMode={isSelectionMode}
                onToggleSelect={handleToggleSelectIndex}
                onReply={(m) => setReplyMessage(m)}
                onEdit={(m, i) => {
                  setEditingIndex(i);
                  setInputText(m.text || '');
                }}
                onDelete={(i) => {
                  onDeleteMessage(i);
                  setChatMessages((prev) => prev.filter((_, idx) => idx !== i));
                }}
                onForward={(m) => onToast(`Forwarding message from ${m.name || 'user'}`)}
                onPin={(m, i) => {
                  setChatMessages((prev) =>
                    prev.map((item, index) => (index === i ? { ...item, isPinned: !item.isPinned } : item))
                  );
                }}
                onReact={(i, emoji) => onReactMessage(i, emoji)}
                onTranslate={(i) => onTranslateMessage?.(i, targetLang)}
                onToggleOriginal={(i) => onToggleOriginalMessage?.(i)}
                onOpenMediaLightbox={(url, type) => setLightboxMedia({ url, type })}
                onToast={onToast}
                onContextMenuOpen={handleOpenContextMenu}
                onVotePoll={handleVotePoll}
              />
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="tg-msg-row incoming">
            <div className="tg-avatar-cell">
              <CachedAvatar src={activeRoom.avatar} name={activeRoom.name} size={34} />
            </div>
            <div className="tg-bubble in-bubble" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 14px' }}>
              <span className="dot animate-bounce" style={{ animationDelay: '0ms' }}>•</span>
              <span className="dot animate-bounce" style={{ animationDelay: '150ms' }}>•</span>
              <span className="dot animate-bounce" style={{ animationDelay: '300ms' }}>•</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* MULTI-SELECTION TOOLBAR */}
      {isSelectionMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            background: 'var(--bg-1)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 20,
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>
            {selectedIndices.size} selected
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--accent-1)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                onToast('Forwarding selected messages...');
                setIsSelectionMode(false);
                setSelectedIndices(new Set());
              }}
            >
              Forward
            </button>
            <button
              style={{ background: 'none', border: 'none', color: '#ff5376', cursor: 'pointer', fontWeight: 600 }}
              onClick={handleDeleteSelected}
            >
              Delete
            </button>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer' }}
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIndices(new Set());
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* COMPOSER BOTTOM INPUT BAR */}
      {!isSelectionMode && (
        <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, background: 'var(--bg-1)' }}>
          {/* Editing Mode Banner */}
          {editingIndex !== null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px',
                background: 'rgba(56, 189, 248, 0.12)',
                borderTop: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-1)', fontWeight: 700 }}>✏️ Editing Message</span>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer' }}
                onClick={() => {
                  setEditingIndex(null);
                  setInputText('');
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Replying Mode Banner */}
          {replyMessage && editingIndex === null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{ width: '3px', height: '28px', background: 'var(--accent-1)', borderRadius: '2px' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-1)' }}>
                    Replying to {replyMessage.from === 'me' ? 'yourself' : replyMessage.name || 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-1)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {replyMessage.text || `[${replyMessage.type}]`}
                  </div>
                </div>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer' }}
                onClick={() => setReplyMessage(null)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Hidden Native File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={handleNativeFileSelect}
          />

          {/* Composer Actions & Textarea / Voice Recording HUD */}
          <div className="composer-row">
            {isRecording ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '24px',
                  padding: '6px 16px',
                }}
              >
                {/* Red pulsing dot & Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#FF453A',
                      opacity: isRecordingPaused ? 0.5 : 1,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                    {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Animated Live Waveform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, justifyContent: 'center' }}>
                  {[12, 20, 26, 16, 30, 14, 24, 32, 18, 22, 10, 28, 16, 24].map((h, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: '3px',
                        height: isRecordingPaused ? '8px' : `${h}px`,
                        background: 'var(--accent-1, #00A884)',
                        borderRadius: '2px',
                        transition: 'height 0.2s ease',
                      }}
                    />
                  ))}
                </div>

                {/* Lock & Pause/Resume / Cancel / Send Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isRecordingLocked ? (
                    <button
                      onClick={() => {
                        setIsRecordingLocked(true);
                        onToast('Recording locked 🔒');
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      🔒 Lock
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRecordingPaused(!isRecordingPaused)}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                      title={isRecordingPaused ? 'Resume Recording' : 'Pause Recording'}
                    >
                      {isRecordingPaused ? '▶️' : '⏸️'}
                    </button>
                  )}

                  <button
                    onClick={handleCancelVoiceRecording}
                    style={{
                      background: 'rgba(255, 69, 58, 0.25)',
                      border: '1px solid rgba(255, 69, 58, 0.5)',
                      color: '#FF453A',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                    title="Cancel Recording"
                  >
                    🗑️
                  </button>

                  <button
                    onClick={handleSendVoiceRecording}
                    style={{
                      background: 'var(--accent-1, #00A884)',
                      border: 'none',
                      color: '#000',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                    title="Send Voice Note"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="composer-ic-btn"
                  title="Emoji & Animated Stickers"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowAttachMenu(false);
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                  </svg>
                </button>

                <button
                  className="composer-ic-btn"
                  title="Attach File or Media"
                  onClick={() => {
                    setShowAttachMenu(!showAttachMenu);
                    setShowEmojiPicker(false);
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                <input
                  type="text"
                  className="composer-input"
                  placeholder={editingIndex !== null ? 'Edit message...' : 'Write a message...'}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={(e) => {
                    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                      e.preventDefault();
                      const file = e.clipboardData.files[0];
                      if (file.type.startsWith('image/')) {
                        onSendAttachment('photo');
                      } else {
                        onSendAttachment('doc');
                      }
                      onToast(`Pasted attachment: ${file.name}`);
                    }
                  }}
                />

                {inputText.trim() ? (
                  <button
                    className="composer-send-btn active"
                    title="Send Message"
                    onClick={handleSend}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className="composer-send-btn active"
                    title="Record Voice Note"
                    onClick={handleStartVoiceRecording}
                    style={{
                      background: 'rgba(0, 168, 132, 0.18)',
                      color: 'var(--accent-1, #00A884)',
                      border: '1px solid rgba(0, 168, 132, 0.35)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ATTACHMENTS MENU POPUP */}
      {showAttachMenu && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '16px',
            background: 'rgba(22, 28, 38, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
            zIndex: 100,
          }}
        >
          {[
            { type: 'photo', label: 'Photo', ic: '🖼️' },
            { type: 'doc', label: 'File', ic: '📄' },
            { type: 'poll', label: 'Poll', ic: '📊' },
            { type: 'location', label: 'Location', ic: '📍' },
            { type: 'contact', label: 'Contact', ic: '👤' },
            { type: 'sketch', label: 'Drawing', ic: '🎨' },
            { type: 'sticker', label: 'Sticker', ic: '✨' },
            { type: 'zip', label: 'Zip Archive', ic: '📦' },
          ].map((item) => (
            <button
              key={item.type}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
              }}
              onClick={() => {
                if (item.type === 'doc' || item.type === 'photo') {
                  fileInputRef.current?.click();
                }
                onSendAttachment(item.type as any);
                setShowAttachMenu(false);
              }}
            >
              <span style={{ fontSize: '22px' }}>{item.ic}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* EMOJI & STICKER PICKER POPUP */}
      {showEmojiPicker && (
        <div style={{ position: 'absolute', bottom: '68px', left: '12px', zIndex: 100 }}>
          <EmojiPicker
            onSelectEmoji={(emoji) => setInputText((prev) => prev + emoji)}
            onSelectSticker={(sticker) => {
              onSendSticker?.(sticker);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* FLOATING TELEGRAM CONTEXT MENU WITH QUICK REACTIONS */}
      {contextMenu?.visible && (
        <>
          <div className="tg-context-backdrop" onClick={() => setContextMenu(null)} />
          <div className="tg-context-menu" style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}>
            {/* Quick Reaction Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '12px 12px 0 0',
              }}
            >
              {['👍', '❤️', '😂', '😮', '😢', '👎'].map((emoji) => (
                <button
                  key={emoji}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, background 0.15s',
                  }}
                  className="quick-react-btn"
                  onClick={() => {
                    if (contextMenu.msgIndex !== undefined) {
                      onReactMessage(contextMenu.msgIndex, emoji);
                    }
                    setContextMenu(null);
                  }}
                >
                  {emoji}
                </button>
              ))}
              <button
                style={{
                  background: 'rgba(0, 168, 132, 0.2)',
                  border: '1px solid var(--accent-1, #00A884)',
                  color: 'var(--accent-1, #00A884)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '16px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="More Reactions"
                onClick={() => {
                  setContextMenu(null);
                  setShowEmojiPicker(true);
                }}
              >
                ➕
              </button>
            </div>

            <button className="tg-context-item" onClick={handleContextMenuReply}>
              <span>↩</span> Reply
            </button>
            <button className="tg-context-item" onClick={handleContextMenuCopy}>
              <span>⧉</span> Copy Text
            </button>
            <button className="tg-context-item" onClick={handleContextMenuEdit}>
              <span>✏️</span> Edit
            </button>
            <button className="tg-context-item" onClick={handleContextMenuForward}>
              <span>➦</span> Forward
            </button>
            <button className="tg-context-item" onClick={handleContextMenuPin}>
              <span>📌</span> {contextMenu && chatMessages[contextMenu.msgIndex]?.isPinned ? 'Unpin Message' : 'Pin Message'}
            </button>
            <button className="tg-context-item" onClick={handleContextMenuSelect}>
              <span>☑️</span> Select
            </button>
            <button className="tg-context-item" onClick={handleContextMenuTranslate}>
              <span>🌐</span> Translate
            </button>
            <button
              className="tg-context-item"
              onClick={() => {
                if (contextMenu) setInfoMessage(chatMessages[contextMenu.msgIndex]);
                setContextMenu(null);
              }}
            >
              <span>ℹ️</span> Message Info
            </button>
            <button className="tg-context-item danger" onClick={handleContextMenuDelete}>
              <span>🗑️</span> Delete
            </button>
          </div>
        </>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxMedia && (
        <MediaLightboxModal
          mediaUrl={lightboxMedia.url}
          type={lightboxMedia.type}
          senderName={activeRoom?.name || 'Sender'}
          onClose={() => setLightboxMedia(null)}
          onToast={onToast}
        />
      )}

      {/* MORE ACTIONS MODAL */}
      {showMoreModal && activeRoom && (
        <MoreActionsModal
          room={activeRoom}
          roomName={activeRoom.name}
          isMuted={activeRoom.muted}
          disappearingTimer={activeRoom.disappearingTimer || 'Off'}
          messages={messages}
          onClose={() => setShowMoreModal(false)}
          onOpenWallpaperModal={() => {
            setShowMoreModal(false);
            setShowWallpaperModal(true);
          }}
          onOpenSharedMediaModal={() => {
            setShowMoreModal(false);
            setShowSharedMediaModal(true);
          }}
          onOpenMuteModal={() => {
            setShowMoreModal(false);
            setShowMuteModal(true);
          }}
          onOpenDisappearingModal={() => {
            setShowMoreModal(false);
            setShowDisappearingModal(true);
          }}
          onClearChat={() => {
            setShowMoreModal(false);
            onClearChat?.();
          }}
          onBlockUser={() => {
            setShowMoreModal(false);
            onBlockUser?.();
          }}
          onExitGroup={() => {
            setShowMoreModal(false);
            onExitGroup?.();
          }}
          onUnfollowChannel={() => {
            setShowMoreModal(false);
            onUnfollowChannel?.();
          }}
        />
      )}

      {/* SUB-MODALS */}
      {showWallpaperModal && (
        <WallpaperPickerModal
          currentWallpaper={roomWallpaper}
          currentDim={roomWallpaperDim}
          onApplyWallpaper={(bg, dim, applyToAll) => {
            onApplyWallpaper?.(bg, dim, applyToAll);
            setShowWallpaperModal(false);
          }}
          onClose={() => setShowWallpaperModal(false)}
        />
      )}

      {showSharedMediaModal && (
        <SharedMediaModal
          roomName={activeRoom?.name || 'Chat Conversation'}
          messages={chatMessages}
          onClose={() => setShowSharedMediaModal(false)}
          onToast={onToast}
        />
      )}

      {showMuteModal && (
        <MutePickerModal
          onSelectDuration={(dur) => {
            onMuteRoom?.(dur);
            setShowMuteModal(false);
          }}
          onClose={() => setShowMuteModal(false)}
        />
      )}

      {showDisappearingModal && (
        <DisappearingMessagesModal
          currentTimer={activeRoom.disappearingTimer || 'Off'}
          onSelectTimer={(t) => {
            onSetDisappearingTimer?.(t);
            setShowDisappearingModal(false);
          }}
          onClose={() => setShowDisappearingModal(false)}
        />
      )}

      {/* PINNED MESSAGES BROWSER MODAL */}
      {showPinnedModal && (
        <PinnedMessagesModal
          pinnedMessages={chatMessages.filter((m) => m.isPinned)}
          onJumpToMessage={(msgId, text) => {
            setShowPinnedModal(false);
            const targetIdx = chatMessages.findIndex((m) => (msgId ? m.id === msgId : m.text === text));
            if (targetIdx !== -1) {
              messageRefs.current[targetIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          onUnpinMessage={(msg) => {
            const idx = chatMessages.findIndex((m) => m.id === msg.id || m.text === msg.text);
            if (idx !== -1) {
              setChatMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, isPinned: false } : m)));
            }
          }}
          onClose={() => setShowPinnedModal(false)}
          onToast={onToast}
        />
      )}

      {/* MESSAGE INFO MODAL */}
      {infoMessage && (
        <MessageInfoModal
          message={infoMessage}
          onClose={() => setInfoMessage(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
};
