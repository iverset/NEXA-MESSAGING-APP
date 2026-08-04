import React, { useState, useEffect, useRef } from 'react';
import { AppSection, ChatRoom, ChatMessage, MailFolder, MailItem, Story } from '../types';
import { getPaletteGrad } from '../data';
import { getUIText } from '../services/translator';
import { CachedAvatar } from './CachedAvatar';
import { GreatMindsRing } from './GreatMindsRing';
import { batchPreloadAvatars } from '../services/ImageCacheService';
import {
  Archive,
  ArchiveRestore,
  Pin,
  PinOff,
  VolumeX,
  Volume2,
  Search,
  ArrowLeft,
  Camera,
  Plus,
  ChevronDown,
  Check,
  CheckCheck,
  Settings,
  X,
  Trash2,
  FolderPlus,
  Folder,
  Eye,
  MessageSquare,
  MoreVertical,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';

interface ListPanelProps {
  section: AppSection;
  chats: ChatRoom[];
  groups: ChatRoom[];
  channels: ChatRoom[];
  communities: ChatRoom[];
  mail: Record<MailFolder, MailItem[]>;
  stories: Story[];
  messages?: Record<string, ChatMessage[]>;
  activeId: string | null;
  activeMailFolder: MailFolder;
  interfaceLang?: string;
  onSelectChat: (id: string) => void;
  onSelectMailFolder: (f: MailFolder) => void;
  onToggleArchive?: (id: string) => void;
  onToggleMute?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleArchivePin?: (id: string) => void;
  onUnarchiveAll?: () => void;
  onMarkAllArchivedRead?: () => void;
  onOpenArchiveSettings?: () => void;
  onDeleteChat?: (id: string) => void;
  onBulkPinChats?: (ids: string[]) => void;
  onBulkMuteChats?: (ids: string[]) => void;
  onBulkArchiveChats?: (ids: string[]) => void;
  onBulkDeleteChats?: (ids: string[]) => void;
  onBulkMarkReadChats?: (ids: string[]) => void;
  onBulkAddToFolder?: (ids: string[], folderName: string) => void;
  onNewAction: () => void;
  onViewStory?: (story: Story) => void;
  onCreateStatus?: () => void;
  onPreviewDp?: (target: { id?: string | number; name: string; avatar?: string }) => void;
  showStoryTrayInChats?: boolean;
  onAskGreatMindsAI?: (query: string) => void;
  onOpenGreatMindsVoiceModal?: () => void;
  onToast: (msg: string) => void;
  isHiddenOnMobile: boolean;
}

function initials(name: string): string {
  if (!name) return '??';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function renderAvatar(avatarStr?: string, nameStr?: string) {
  if (avatarStr && (avatarStr.startsWith('http') || avatarStr.startsWith('data:'))) {
    return (
      <img
        src={avatarStr}
        alt={nameStr || 'Avatar'}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return initials(nameStr || '');
}

interface SwipeableChatItemProps {
  chat: ChatRoom;
  isSelected: boolean;
  isMultiSelected: boolean;
  isMultiSelectMode: boolean;
  isArchiveView?: boolean;
  onSelect: () => void;
  onLongPressChat: () => void;
  onLongPressAvatar: () => void;
  onSwipeAction: () => void;
  actionType: 'archive' | 'unarchive';
  onPreviewDp?: () => void;
}

const SwipeableChatItem: React.FC<SwipeableChatItemProps> = ({
  chat,
  isSelected,
  isMultiSelected,
  isMultiSelectMode,
  isArchiveView = false,
  onSelect,
  onLongPressChat,
  onLongPressAvatar,
  onSwipeAction,
  actionType,
  onPreviewDp,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const vibratedRef = useRef(false);

  // Long press timers
  const chatLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const avatarLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isChatLongPressed = useRef(false);
  const isAvatarLongPressed = useRef(false);

  // Row Touch Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartXRef.current = clientX;
    setIsDragging(true);
    vibratedRef.current = false;
    isChatLongPressed.current = false;

    // Start long press timer for chat row selection
    chatLongPressTimer.current = setTimeout(() => {
      isChatLongPressed.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
      onLongPressChat();
    }, 400);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartXRef.current;

    // Cancel long press timer if dragging starts
    if (Math.abs(deltaX) > 10 && chatLongPressTimer.current) {
      clearTimeout(chatLongPressTimer.current);
      chatLongPressTimer.current = null;
    }

    // Left swipe gesture (only when not in multi-select mode)
    if (!isMultiSelectMode && deltaX < 0) {
      const clamped = Math.max(-120, deltaX);
      setTranslateX(clamped);

      if (clamped < -70 && !vibratedRef.current) {
        vibratedRef.current = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (chatLongPressTimer.current) {
      clearTimeout(chatLongPressTimer.current);
      chatLongPressTimer.current = null;
    }

    if (!isDragging) return;
    setIsDragging(false);

    if (translateX < -75) {
      setTranslateX(-280);
      setTimeout(() => {
        onSwipeAction();
        setTranslateX(0);
      }, 180);
    } else {
      setTranslateX(0);
    }

    // Trigger click/select if not a long press
    if (!isChatLongPressed.current && translateX === 0) {
      onSelect();
    }
  };

  // Avatar Long Press Handlers
  const handleAvatarTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    isAvatarLongPressed.current = false;

    avatarLongPressTimer.current = setTimeout(() => {
      isAvatarLongPressed.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      onLongPressAvatar();
    }, 400);
  };

  const handleAvatarTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (avatarLongPressTimer.current) {
      clearTimeout(avatarLongPressTimer.current);
      avatarLongPressTimer.current = null;
    }

    if (!isAvatarLongPressed.current) {
      if (onPreviewDp) onPreviewDp();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: actionType === 'archive' ? 'rgba(0, 168, 132, 0.25)' : 'rgba(0, 240, 255, 0.25)',
      }}
    >
      {/* Background Swipe Action Indicator */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '6px',
          color: actionType === 'archive' ? 'var(--accent-1, #00A884)' : '#fff',
          fontWeight: 700,
          fontSize: '12px',
          paddingRight: '16px',
        }}
      >
        {actionType === 'archive' ? (
          <>
            <Archive size={18} />
            <span>Archive</span>
          </>
        ) : (
          <>
            <ArchiveRestore size={18} />
            <span>Unarchive</span>
          </>
        )}
      </div>

      {/* Main Sliding Chat Row */}
      <div
        className={`list-item ${isSelected ? 'selected' : ''} ${isMultiSelected ? 'selected' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          position: 'relative',
          background: isMultiSelected ? 'var(--bg-3, rgba(255,255,255,0.12))' : 'var(--bg-1, #111b21)',
          zIndex: 2,
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
        }}
      >
        {/* Multi-Select Checkbox indicator */}
        {isMultiSelectMode && (
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: isMultiSelected ? 'none' : '2px solid var(--text-1)',
              background: isMultiSelected ? 'var(--accent-1, #00A884)' : 'transparent',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {isMultiSelected && <Check size={15} strokeWidth={3} />}
          </div>
        )}

        {/* Avatar with Peek Long-Press listener */}
        <div
          onTouchStart={handleAvatarTouchStart}
          onTouchEnd={handleAvatarTouchEnd}
          onMouseDown={handleAvatarTouchStart}
          onMouseUp={handleAvatarTouchEnd}
          style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
          title="Long-press to peek at messages"
        >
          <CachedAvatar
            src={chat.avatar}
            name={chat.name}
            size={48}
            showOnlineBadge={false}
          />
        </div>

        <div className="li-body" style={{ flex: 1, minWidth: 0 }}>
          <div className="li-top">
            <span className="li-name" style={{ fontWeight: 600, color: 'var(--text-0)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>{chat.name}</span>
            </span>
            <span className="li-time">{chat.time}</span>
          </div>
          <div className="li-sub">
            <span className="li-msg" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {(chat.pinned || (isArchiveView && chat.archivedPinned)) && (
                <Pin size={13} style={{ color: 'var(--accent-1, #00A884)', flexShrink: 0 }} />
              )}
              {chat.muted && <VolumeX size={13} style={{ color: 'var(--text-1)', flexShrink: 0 }} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {chat.last}
              </span>
            </span>
            {!!chat.unread && (
              <span className={`badge ${chat.muted ? 'mute' : ''}`}>
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ListPanel: React.FC<ListPanelProps> = ({
  section,
  chats,
  groups,
  channels,
  communities,
  mail,
  stories,
  messages = {},
  activeId,
  activeMailFolder,
  interfaceLang = 'en',
  onSelectChat,
  onSelectMailFolder,
  onToggleArchive,
  onToggleMute,
  onTogglePin,
  onToggleArchivePin,
  onUnarchiveAll,
  onMarkAllArchivedRead,
  onOpenArchiveSettings,
  onDeleteChat,
  onBulkPinChats,
  onBulkMuteChats,
  onBulkArchiveChats,
  onBulkDeleteChats,
  onBulkMarkReadChats,
  onBulkAddToFolder,
  onNewAction,
  onViewStory,
  onCreateStatus,
  onPreviewDp,
  showStoryTrayInChats = true,
  onAskGreatMindsAI,
  onOpenGreatMindsVoiceModal,
  onOpenAuthModal,
  onToast,
  isHiddenOnMobile,
}) => {
  const [search, setSearch] = useState('');
  const [isArchiveHidden, setIsArchiveHidden] = useState<boolean>(false);
  const [viewingArchiveView, setViewingArchiveView] = useState<boolean>(false);
  const [showArchiveMenu, setShowArchiveMenu] = useState<boolean>(false);

  // Multi-Select Mode States
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const isMultiSelectMode = selectedChatIds.length > 0;

  // Peek Modal State
  const [peekingChat, setPeekingChat] = useState<ChatRoom | null>(null);

  // Folder Picker Modal State
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  // Swipe Left on Archive Top Bar state
  const [archiveBarTranslateX, setArchiveBarTranslateX] = useState(0);
  const [isBarDragging, setIsBarDragging] = useState(false);
  const barDragStartRef = useRef(0);

  const rawTitle = viewingArchiveView
    ? 'Archived Chats'
    : section.charAt(0).toUpperCase() + section.slice(1);
  const title = getUIText(section, interfaceLang) !== section ? getUIText(section, interfaceLang) : rawTitle;
  const q = search.toLowerCase().trim();

  const matchesSearch = (r: ChatRoom, searchStr: string): boolean => {
    if (!searchStr.trim()) return true;
    const rawQ = searchStr.toLowerCase().trim();
    const cleanHandle = rawQ.replace(/^@/, '');
    const digitsQ = rawQ.replace(/[^0-9]/g, '');

    if (r.name.toLowerCase().includes(rawQ)) return true;
    if (r.username && r.privacySettings?.findMeByUsername !== 'nobody') {
      if (r.username.toLowerCase().includes(cleanHandle)) return true;
    }
    if (r.phone && digitsQ.length >= 3 && r.privacySettings?.findMeByPhone !== 'nobody') {
      const digitsPhone = r.phone.replace(/[^0-9]/g, '');
      if (digitsPhone.includes(digitsQ)) return true;
    }
    if (r.bio && r.bio.toLowerCase().includes(rawQ)) return true;

    return false;
  };

  const getSearchScore = (r: ChatRoom, searchStr: string): number => {
    if (!searchStr.trim()) return 0;
    const rawQ = searchStr.toLowerCase().trim();
    const cleanHandle = rawQ.replace(/^@/, '');
    const digitsQ = rawQ.replace(/[^0-9]/g, '');

    if (r.username && r.username.toLowerCase() === cleanHandle) return 100;
    if (r.username && r.username.toLowerCase().startsWith(cleanHandle)) return 85;
    if (r.phone && digitsQ.length >= 3 && r.phone.replace(/[^0-9]/g, '') === digitsQ) return 90;
    if (r.name.toLowerCase().startsWith(rawQ)) return 75;
    if (r.name.toLowerCase().includes(rawQ)) return 60;
    return 10;
  };

  const showStoriesBar = section === 'chats' && !viewingArchiveView && showStoryTrayInChats && !isMultiSelectMode;
  const showFolderTabs = section === 'mail';

  const mailFolders: MailFolder[] = ['inbox', 'sent', 'drafts', 'spam', 'trash'];

  const archivedList = chats.filter((c) => c.archived);
  const activeChats = chats.filter((c) => !c.archived);

  const archivedUnreadTotal = archivedList.reduce((acc, curr) => acc + (curr.unread || 0), 0);

  useEffect(() => {
    const allAvatarUrls = [
      ...chats.map((c) => c.avatar),
      ...groups.map((g) => g.avatar),
      ...channels.map((ch) => ch.avatar),
      ...communities.map((cm) => cm.avatar),
      ...stories.map((st) => st.avatar),
    ];
    batchPreloadAvatars(allAvatarUrls, 96);
  }, [chats, groups, channels, communities, stories]);

  // Handle Chat Selection in List or Multi-Select Mode
  const handleChatRowSelect = (chatId: string) => {
    if (isMultiSelectMode) {
      if (selectedChatIds.includes(chatId)) {
        setSelectedChatIds((prev) => prev.filter((id) => id !== chatId));
      } else {
        setSelectedChatIds((prev) => [...prev, chatId]);
      }
    } else {
      onSelectChat(chatId);
    }
  };

  const handleChatRowLongPress = (chatId: string) => {
    if (!selectedChatIds.includes(chatId)) {
      setSelectedChatIds((prev) => [...prev, chatId]);
    }
  };

  // Bulk Actions
  const handleExecBulkPin = () => {
    if (onBulkPinChats) {
      onBulkPinChats(selectedChatIds);
    } else {
      selectedChatIds.forEach((id) => onTogglePin && onTogglePin(id));
      onToast(`Updated pin status for ${selectedChatIds.length} chats`);
    }
    setSelectedChatIds([]);
  };

  const handleExecBulkMute = () => {
    if (onBulkMuteChats) {
      onBulkMuteChats(selectedChatIds);
    } else {
      selectedChatIds.forEach((id) => onToggleMute && onToggleMute(id));
      onToast(`Updated mute status for ${selectedChatIds.length} chats`);
    }
    setSelectedChatIds([]);
  };

  const handleExecBulkArchive = () => {
    if (onBulkArchiveChats) {
      onBulkArchiveChats(selectedChatIds);
    } else {
      selectedChatIds.forEach((id) => onToggleArchive && onToggleArchive(id));
      onToast(`Archived ${selectedChatIds.length} chats`);
    }
    setSelectedChatIds([]);
  };

  const handleExecBulkDelete = () => {
    if (onBulkDeleteChats) {
      onBulkDeleteChats(selectedChatIds);
    } else {
      selectedChatIds.forEach((id) => onDeleteChat && onDeleteChat(id));
      onToast(`Deleted ${selectedChatIds.length} chats`);
    }
    setSelectedChatIds([]);
  };

  const handleExecBulkMarkRead = () => {
    if (onBulkMarkReadChats) {
      onBulkMarkReadChats(selectedChatIds);
    } else {
      onToast(`Marked ${selectedChatIds.length} chats as read`);
    }
    setSelectedChatIds([]);
  };

  const handleExecAddToFolder = (folderName: string) => {
    if (onBulkAddToFolder) {
      onBulkAddToFolder(selectedChatIds, folderName);
    } else {
      onToast(`Added ${selectedChatIds.length} chats to "${folderName}"`);
    }
    setShowFolderModal(false);
    setSelectedChatIds([]);
  };

  // Archive Bar Touch Gesture Handlers
  const handleBarTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    barDragStartRef.current = clientX;
    setIsBarDragging(true);
  };

  const handleBarTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isBarDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - barDragStartRef.current;
    if (deltaX < 0) {
      setArchiveBarTranslateX(deltaX);
    }
  };

  const handleBarTouchEnd = () => {
    if (!isBarDragging) return;
    setIsBarDragging(false);
    if (archiveBarTranslateX < -60) {
      setIsArchiveHidden(true);
      onToast('Archived Chats bar hidden. Pull down at top to reveal.');
    }
    setArchiveBarTranslateX(0);
  };

  return (
    <div className={`list-panel ${isHiddenOnMobile ? 'hide' : ''}`}>
      {/* 1. BULK ACTION BAR MENU (Overlays list header when chats are selected) */}
      {isMultiSelectMode ? (
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-2, #1F2C34)',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            zIndex: 10,
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSelectedChatIds([])}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'var(--text-0)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Cancel Selection"
            >
              <X size={18} />
            </button>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-0)' }}>
              {selectedChatIds.length} Selected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleExecBulkPin}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-0)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Pin / Unpin Selected"
            >
              <Pin size={17} />
            </button>

            <button
              onClick={handleExecBulkMute}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-0)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Mute / Unmute Selected"
            >
              <VolumeX size={17} />
            </button>

            <button
              onClick={handleExecBulkArchive}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-0)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Archive Selected"
            >
              <Archive size={17} />
            </button>

            <button
              onClick={handleExecBulkMarkRead}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-0)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Mark as Read"
            >
              <CheckCheck size={17} />
            </button>

            <button
              onClick={() => setShowFolderModal(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'var(--text-0)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Add to Folder"
            >
              <FolderPlus size={17} />
            </button>

            <button
              onClick={handleExecBulkDelete}
              style={{
                background: 'rgba(255, 111, 89, 0.18)',
                border: 'none',
                color: 'var(--warm, #FF6F59)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Delete Selected"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD LIST HEADER */
        <div className="list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {viewingArchiveView && (
              <button
                onClick={() => setViewingArchiveView(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'var(--text-0)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Back to All Chats"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1>{viewingArchiveView ? 'Archived Chats' : title}</h1>
              <div className="brandline" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          </div>

          {viewingArchiveView ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-1)', fontWeight: 600 }}>
                {archivedList.length} archived
              </span>

              {/* Archive Three-Dot Menu */}
              <button
                onClick={() => setShowArchiveMenu(!showArchiveMenu)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: 'var(--text-0)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Archive Options"
              >
                <MoreVertical size={18} />
              </button>

              {showArchiveMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '40px',
                    zIndex: 200,
                    background: 'var(--bg-1, #1F2C34)',
                    border: '1px solid var(--border, rgba(255,255,255,0.15))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '180px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowArchiveMenu(false);
                      if (onUnarchiveAll) onUnarchiveAll();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-0)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <ArchiveRestore size={16} />
                    <span>Unarchive All</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowArchiveMenu(false);
                      if (onMarkAllArchivedRead) onMarkAllArchivedRead();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-0)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Check size={16} />
                    <span>Mark All as Read</span>
                  </button>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />

                  <button
                    onClick={() => {
                      setShowArchiveMenu(false);
                      if (onOpenArchiveSettings) onOpenArchiveSettings();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-0)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Settings size={16} />
                    <span>Archive Settings</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Dual-Purpose Global Search Bar with Meta AI / Great Minds AI Integration */}
      {!isMultiSelectMode && (
        <div style={{ padding: '0 10px', marginBottom: '8px' }}>
          <div className="search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ color: 'var(--text-1)', flexShrink: 0 }} />
            <input
              placeholder={viewingArchiveView ? 'Search archived chats...' : 'Search chats or ask Great Minds AI...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  if (onAskGreatMindsAI) {
                    onAskGreatMindsAI(search.trim());
                    setSearch('');
                  } else {
                    onSelectChat('greatminds_ai');
                  }
                }
              }}
              style={{ flex: 1, paddingRight: '36px' }}
            />
            <div
              style={{ position: 'absolute', right: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => {
                if (search.trim() && onAskGreatMindsAI) {
                  onAskGreatMindsAI(search.trim());
                  setSearch('');
                } else {
                  onSelectChat('greatminds_ai');
                }
              }}
              title="Ask Great Minds AI"
              aria-label="Ask Great Minds AI"
            >
              <GreatMindsRing size={22} animated glow />
            </div>
          </div>

          {/* Quick AI Prompt Suggestions when typing search */}
          {search.trim().length > 0 && (
            <div
              style={{
                marginTop: '6px',
                background: 'var(--bg-1, #111b21)',
                border: '1px solid var(--border, rgba(255,255,255,0.12))',
                borderRadius: '12px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <div
                onClick={() => {
                  if (onAskGreatMindsAI) onAskGreatMindsAI(search);
                  else onSelectChat('greatminds_ai');
                  setSearch('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'rgba(0, 242, 254, 0.08)',
                }}
              >
                <GreatMindsRing size={18} animated glow />
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Ask Great Minds AI: <span style={{ color: '#00F2FE' }}>"{search}"</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    if (onAskGreatMindsAI) onAskGreatMindsAI(`/imagine ${search}`);
                    else onSelectChat('greatminds_ai');
                    setSearch('');
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    fontSize: '11.5px',
                    color: 'var(--text-0)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center',
                  }}
                >
                  🎨 Imagine
                </button>
                <button
                  onClick={() => {
                    if (onAskGreatMindsAI) onAskGreatMindsAI(`Search web for ${search}`);
                    else onSelectChat('greatminds_ai');
                    setSearch('');
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '5px 8px',
                    fontSize: '11.5px',
                    color: 'var(--text-0)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center',
                  }}
                >
                  🔍 Web Search
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stories Bar */}
      {showStoriesBar && section !== 'stories' && (
        <div className="stories-bar">
          {stories.map((s) => (
            <div
              key={s.id}
              className="story"
              onClick={() => {
                if (onViewStory) onViewStory(s);
                else onToast(`Opening story from ${s.name}`);
              }}
            >
              <div className={`story-ring ${s.seen ? 'seen' : ''}`}>
                <div className="inner">
                  <CachedAvatar src={s.avatar} name={s.name} size={42} showOnlineBadge={false} />
                </div>
              </div>
              <span>{s.mine ? 'Your story' : s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mail Folder Tabs */}
      {showFolderTabs && (
        <div className="folder-tabs">
          {mailFolders.map((f) => (
            <div
              key={f}
              className={`folder-tab ${activeMailFolder === f ? 'active' : ''}`}
              onClick={() => onSelectMailFolder(f)}
            >
              {getUIText(f, interfaceLang)}
            </div>
          ))}
        </div>
      )}

      {/* Main List Scroll Area */}
      <div className="list-scroll">
        {/* ARCHIVED CHATS TOP BAR MECHANICS */}
        {section === 'chats' && !viewingArchiveView && archivedList.length > 0 && !isMultiSelectMode && (
          <div style={{ padding: '0 10px 8px 10px' }}>
            {!isArchiveHidden ? (
              <div
                onTouchStart={handleBarTouchStart}
                onTouchMove={handleBarTouchMove}
                onTouchEnd={handleBarTouchEnd}
                onMouseDown={handleBarTouchStart}
                onMouseMove={handleBarTouchMove}
                onMouseUp={handleBarTouchEnd}
                style={{
                  transform: `translateX(${archiveBarTranslateX}px)`,
                  transition: isBarDragging ? 'none' : 'transform 0.2s ease-out',
                  background: 'var(--bg-2, rgba(255, 255, 255, 0.05))',
                  border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onClick={() => setViewingArchiveView(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(0, 168, 132, 0.18)',
                      color: 'var(--accent-1, #00A884)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Archive size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>
                      Archived Chats
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>
                      {archivedList.length} chat{archivedList.length > 1 ? 's' : ''} stored
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {archivedUnreadTotal > 0 && (
                    <span
                      className="badge"
                      style={{ background: 'var(--accent-1, #00A884)', color: '#fff', fontSize: '11px' }}
                    >
                      {archivedUnreadTotal}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsArchiveHidden(true);
                      onToast('Archived Chats folder hidden. Pull down at top to reveal.');
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: 'var(--text-1)',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                    title="Hide archive bar"
                  >
                    Hide
                  </button>
                </div>
              </div>
            ) : (
              /* Pull/Drag down to reveal handle */
              <div
                onClick={() => {
                  setIsArchiveHidden(false);
                  onToast('Revealed Archived Chats folder');
                }}
                style={{
                  background: 'rgba(0, 168, 132, 0.1)',
                  border: '1px dashed var(--accent-1, #00A884)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  textAlign: 'center',
                  fontSize: '11.5px',
                  color: 'var(--accent-1, #00A884)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ChevronDown size={15} />
                <span>Pull down to reveal Archived Chats ({archivedList.length})</span>
              </div>
            )}
          </div>
        )}

        {/* 1. CHATS SECTION (MAIN LIST) */}
        {section === 'chats' && !viewingArchiveView && (
          activeChats
            .filter((r) => matchesSearch(r, search))
            .sort((a, b) => {
              if (q) {
                const scoreA = getSearchScore(a, search);
                const scoreB = getSearchScore(b, search);
                if (scoreA !== scoreB) return scoreB - scoreA;
              }
              return Number(b.pinned) - Number(a.pinned);
            })
            .map((r) => (
              <SwipeableChatItem
                key={r.id}
                chat={r}
                isSelected={activeId === r.id}
                isMultiSelected={selectedChatIds.includes(r.id)}
                isMultiSelectMode={isMultiSelectMode}
                onSelect={() => handleChatRowSelect(r.id)}
                onLongPressChat={() => handleChatRowLongPress(r.id)}
                onLongPressAvatar={() => setPeekingChat(r)}
                onSwipeAction={() => {
                  if (onToggleArchive) onToggleArchive(r.id);
                }}
                actionType="archive"
                onPreviewDp={() => onPreviewDp && onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar })}
              />
            ))
        )}

        {/* 2. ARCHIVED CHATS FOLDER VIEW */}
        {section === 'chats' && viewingArchiveView && (
          <div>
            {archivedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-1)', fontSize: '13px' }}>
                No chats in Archive folder.
              </div>
            ) : (
              archivedList
                .filter((r) => matchesSearch(r, search))
                .sort((a, b) => {
                  if (q) {
                    const scoreA = getSearchScore(a, search);
                    const scoreB = getSearchScore(b, search);
                    if (scoreA !== scoreB) return scoreB - scoreA;
                  }
                  return Number(b.archivedPinned) - Number(a.archivedPinned);
                })
                .map((r) => (
                  <SwipeableChatItem
                    key={r.id}
                    chat={r}
                    isSelected={activeId === r.id}
                    isMultiSelected={selectedChatIds.includes(r.id)}
                    isMultiSelectMode={isMultiSelectMode}
                    isArchiveView={true}
                    onSelect={() => handleChatRowSelect(r.id)}
                    onLongPressChat={() => handleChatRowLongPress(r.id)}
                    onLongPressAvatar={() => setPeekingChat(r)}
                    onSwipeAction={() => {
                      if (onToggleArchive) onToggleArchive(r.id);
                    }}
                    actionType="unarchive"
                    onPreviewDp={() => onPreviewDp && onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar })}
                  />
                ))
            )}
          </div>
        )}

        {/* 3. GROUPS SECTION */}
        {section === 'groups' &&
          groups
            .filter((r) => r.name.toLowerCase().includes(q))
            .map((r) => (
              <div
                key={r.id}
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
              >
                <CachedAvatar
                  src={r.avatar}
                  name={r.name}
                  size={48}
                  showOnlineBadge={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                />
                <div className="li-body">
                  <div className="li-top">
                    <span className="li-name">{r.name}</span>
                  </div>
                  <div className="li-sub">
                    <span className="li-msg">{r.last}</span>
                    {!!r.unread && <span className="badge">{r.unread}</span>}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-2)', marginTop: '2px' }}>
                    {r.members} members
                  </div>
                </div>
              </div>
            ))}

        {/* 4. CHANNELS SECTION */}
        {section === 'channels' &&
          channels
            .filter((r) => r.name.toLowerCase().includes(q))
            .map((r) => (
              <div
                key={r.id}
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
              >
                <CachedAvatar
                  src={r.avatar}
                  name={r.name}
                  size={48}
                  showOnlineBadge={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                />
                <div className="li-body">
                  <div className="li-top">
                    <span className="li-name">{r.name}</span>
                  </div>
                  <div className="li-sub">
                    <span className="li-msg">{r.last}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-2)', marginTop: '2px' }}>
                    {r.type} · {r.subs} subscribers
                  </div>
                </div>
              </div>
            ))}

        {/* 5. COMMUNITIES SECTION */}
        {section === 'communities' &&
          communities
            .filter((r) => r.name.toLowerCase().includes(q))
            .map((r) => (
              <div
                key={r.id}
                className="list-item"
                onClick={() => onToast(`Opened ${r.name}`)}
              >
                <CachedAvatar
                  src={r.avatar}
                  name={r.name}
                  size={48}
                  showOnlineBadge={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                />
                <div className="li-body">
                  <div className="li-top">
                    <span className="li-name">{r.name}</span>
                  </div>
                  <div className="li-msg">{r.desc}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-2)', marginTop: '2px' }}>
                    {r.groups} groups · {r.channels} channels
                  </div>
                </div>
              </div>
            ))}

        {/* 6. MAIL SECTION */}
        {section === 'mail' && (() => {
          const folderList = mail[activeMailFolder] || [];
          if (!folderList.length) {
            return <div className="section-empty">Nothing here yet.</div>;
          }
          return folderList.map((m) => (
            <div
              key={m.id}
              className="list-item"
              onClick={() => onToast(`Viewing email from ${m.from}`)}
            >
              <div
                className="avatar round"
                style={{
                  background: !(m.avatar?.startsWith('http') || m.avatar?.startsWith('data:')) ? getPaletteGrad(m.id.length) : undefined,
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPreviewDp) onPreviewDp({ name: m.from.replace('To: ', ''), avatar: m.avatar });
                }}
                title={`View ${m.from}'s profile photo`}
              >
                {renderAvatar(m.avatar || getPaletteGrad(m.id.length), m.from.replace('To: ', ''))}
              </div>
              <div className="li-body">
                <div className="li-top">
                  <span className="li-name">
                    {m.unread ? '● ' : ''}
                    {m.from}
                  </span>
                  <span className="li-time">{m.time}</span>
                </div>
                <div className="li-msg" style={{ fontWeight: 600, color: 'var(--text-0)' }}>
                  {m.subject}
                </div>
                <div className="li-msg">{m.snippet}</div>
              </div>
            </div>
          ));
        })()}

        {/* 7. STORIES / STATUS SECTION */}
        {section === 'stories' && (
          <div style={{ paddingBottom: '16px' }}>
            {(() => {
              const myStory = stories.find((s) => s.mine) || stories[0];
              const hasMyItems = myStory && myStory.items && myStory.items.length > 0;
              return (
                <div
                  className="list-item"
                  style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))', paddingBottom: '12px', marginBottom: '8px' }}
                >
                  <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => {
                      if (hasMyItems && onViewStory) {
                        onViewStory(myStory);
                      } else if (onCreateStatus) {
                        onCreateStatus();
                      }
                    }}
                  >
                    <div className={`story-ring ${myStory?.seen ? 'seen' : ''}`} style={{ width: '52px', height: '52px' }}>
                      <div className="inner">
                        <div
                          className="avatar-sm"
                          style={{
                            background: !(myStory?.avatar?.startsWith('http') || myStory?.avatar?.startsWith('data:')) ? myStory?.avatar : undefined,
                            overflow: 'hidden',
                          }}
                        >
                          {renderAvatar(myStory?.avatar, myStory?.name || 'You')}
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onCreateStatus) onCreateStatus();
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        background: 'var(--accent-1, #00A884)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--bg-1, #111b21)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                      }}
                      title="Add status update"
                    >
                      <Plus size={14} />
                    </div>
                  </div>

                  <div
                    className="li-body"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (hasMyItems && onViewStory) {
                        onViewStory(myStory);
                      } else if (onCreateStatus) {
                        onCreateStatus();
                      }
                    }}
                  >
                    <div className="li-top">
                      <span className="li-name" style={{ fontWeight: 700 }}>My Status</span>
                    </div>
                    <div className="li-msg">
                      {hasMyItems ? `${myStory.items?.length} active update${(myStory.items?.length || 0) > 1 ? 's' : ''} · Tap to view` : 'Tap to add status update'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={onCreateStatus}
                      style={{
                        background: 'var(--bg-3, rgba(255,255,255,0.1))',
                        border: 'none',
                        color: 'var(--text-0)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Create status"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              );
            })()}

            <div style={{ padding: '6px 16px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-1, #00A884)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent updates
            </div>

            {stories
              .filter((s) => !s.mine)
              .map((s) => (
                <div
                  key={s.id}
                  className="list-item"
                  onClick={() => onViewStory && onViewStory(s)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`story-ring ${s.seen ? 'seen' : ''}`} style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                    <div className="inner">
                      <div
                        className="avatar-sm"
                        style={{
                          background: !(s.avatar?.startsWith('http') || s.avatar?.startsWith('data:')) ? s.avatar : undefined,
                          overflow: 'hidden',
                        }}
                      >
                        {renderAvatar(s.avatar, s.name)}
                      </div>
                    </div>
                  </div>
                  <div className="li-body">
                    <div className="li-top">
                      <span className="li-name">{s.name}</span>
                      <span className="li-time">{s.timeAgo || 'Today'}</span>
                    </div>
                    <div className="li-msg">
                      {s.seen ? 'Viewed update' : 'New status update · Tap to view'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!isMultiSelectMode && (
        <div className="new-fab" onClick={onNewAction} title="Create New">
          <Plus size={22} />
        </div>
      )}

      {/* 2. PEEK AT MESSAGES MODAL */}
      {peekingChat && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setPeekingChat(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'var(--bg-1, #111B21)',
              border: '1px solid var(--border, rgba(255,255,255,0.15))',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'scaleUp 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--bg-2, #1F2C34)',
                borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CachedAvatar
                  src={peekingChat.avatar}
                  name={peekingChat.name}
                  size={42}
                  showOnlineBadge={false}
                />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-0)' }}>
                    {peekingChat.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-1, #00A884)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={12} />
                    <span>Peeking (unread status preserved)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPeekingChat(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'var(--text-0)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Preview Body */}
            <div
              style={{
                padding: '16px',
                maxHeight: '280px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'var(--bg-0, #0B141A)',
              }}
            >
              {(() => {
                const list = messages[peekingChat.id] || [];
                const recentMsgs = list.length > 0 ? list.slice(-4) : [];

                if (recentMsgs.length === 0) {
                  return (
                    <div
                      style={{
                        background: 'var(--bg-2, #1F2C34)',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        color: 'var(--text-0)',
                        borderLeft: '3px solid var(--accent-1, #00A884)',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: 'var(--text-1)', marginBottom: '4px' }}>
                        {peekingChat.time || 'Latest'}
                      </div>
                      {peekingChat.last}
                    </div>
                  );
                }

                return recentMsgs.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: m.from === 'me' ? 'var(--accent-2, #005C4B)' : 'var(--bg-2, #202C33)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: m.from === 'me' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div>{m.text}</div>
                    <div style={{ fontSize: '10px', opacity: 0.6, textAlign: 'right', marginTop: '3px' }}>
                      {m.time}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--bg-1, #111B21)',
                borderTop: '1px solid var(--border, rgba(255,255,255,0.1))',
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={() => {
                  const id = peekingChat.id;
                  setPeekingChat(null);
                  onSelectChat(id);
                }}
                style={{
                  flex: 1,
                  background: 'var(--accent-1, #00A884)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <MessageSquare size={16} />
                <span>Open Chat</span>
              </button>

              <button
                onClick={() => {
                  if (onToggleMute) onToggleMute(peekingChat.id);
                  onToast(peekingChat.muted ? `Unmuted ${peekingChat.name}` : `Muted ${peekingChat.name}`);
                  setPeekingChat((prev) => prev ? { ...prev, muted: !prev.muted } : null);
                }}
                style={{
                  background: 'var(--bg-3, rgba(255,255,255,0.1))',
                  color: 'var(--text-0)',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={peekingChat.muted ? 'Unmute' : 'Mute'}
              >
                {peekingChat.muted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => {
                  if (onToggleArchive) onToggleArchive(peekingChat.id);
                  onToast(peekingChat.archived ? `Unarchived ${peekingChat.name}` : `Archived ${peekingChat.name}`);
                  setPeekingChat(null);
                }}
                style={{
                  background: 'var(--bg-3, rgba(255,255,255,0.1))',
                  color: 'var(--text-0)',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={peekingChat.archived ? 'Unarchive' : 'Archive'}
              >
                {peekingChat.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD TO FOLDER MODAL */}
      {showFolderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowFolderModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              background: 'var(--bg-1, #1F2C34)',
              border: '1px solid var(--border, rgba(255,255,255,0.15))',
              borderRadius: '18px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-0)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={18} style={{ color: 'var(--accent-1, #00A884)' }} />
                <span>Add to Folder</span>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-1)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '14px' }}>
              Select a folder to organize {selectedChatIds.length} selected chat{selectedChatIds.length > 1 ? 's' : ''}:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {['Work', 'Personal', 'Favorites', 'Urgent', 'Projects'].map((folder) => (
                <button
                  key={folder}
                  onClick={() => handleExecAddToFolder(folder)}
                  style={{
                    background: 'var(--bg-2, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: 'var(--text-0)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Folder size={16} style={{ color: 'var(--accent-1, #00A884)' }} />
                  <span>{folder}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                placeholder="Custom Folder Name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-3, rgba(255,255,255,0.1))',
                  border: '1px solid var(--border, rgba(255,255,255,0.15))',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  if (newFolderName.trim()) {
                    handleExecAddToFolder(newFolderName.trim());
                    setNewFolderName('');
                  }
                }}
                disabled={!newFolderName.trim()}
                style={{
                  background: 'var(--accent-1, #00A884)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newFolderName.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* META AI STYLE FLOATING ACTION RING BUTTON - POSITIONED ABOVE ADD CHAT FAB */}
      {section === 'chats' && !viewingArchiveView && !isMultiSelectMode && (
        <button
          onClick={() => onSelectChat('greatminds_ai')}
          className="gm-floating-ai-fab"
          style={{
            position: 'absolute',
            bottom: '86px',
            right: '22px',
            zIndex: 90,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--bg-1, #111b21)',
            border: '2px solid rgba(0, 242, 254, 0.5)',
            boxShadow: '0 8px 24px rgba(0, 198, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease, bottom 0.2s ease',
          }}
          title="Open Great Minds AI"
          aria-label="Open Great Minds AI"
        >
          <GreatMindsRing size={38} animated glow />
        </button>
      )}
    </div>
  );
};
