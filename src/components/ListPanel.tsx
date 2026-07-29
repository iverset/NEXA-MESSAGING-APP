import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  BellOff,
  BellRing,
  ChevronDown,
  EyeOff,
  MoreVertical,
  Pin,
  PinOff,
  Search,
  UserPlus,
} from 'lucide-react';
import { AppSection, ChatRoom, MailFolder, MailItem, Story } from '../types';
import { getPaletteGrad } from '../data';
import { getUIText } from '../services/translator';
import { CachedAvatar } from './CachedAvatar';
import { batchPreloadAvatars } from '../services/ImageCacheService';
import { SwipeRow, haptic } from './SwipeRow';
import { ArchiveSnackbar } from './ArchiveSnackbar';

interface ListPanelProps {
  section: AppSection;
  chats: ChatRoom[];
  groups: ChatRoom[];
  channels: ChatRoom[];
  communities: ChatRoom[];
  mail: Record<MailFolder, MailItem[]>;
  stories: Story[];
  activeId: string | null;
  activeMailFolder: MailFolder;
  interfaceLang?: string;
  onSelectChat: (id: string) => void;
  onSelectMailFolder: (f: MailFolder) => void;
  onToggleArchive?: (id: string) => void;
  onToggleMute?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleArchivePin?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onUnarchiveAll?: () => void;
  onMarkArchivedRead?: () => void;
  onOpenArchiveSettings?: () => void;
  onSimulateUnknownSender?: () => void;
  onNewAction: () => void;
  onViewStory?: (story: Story) => void;
  onCreateStatus?: () => void;
  onPreviewDp?: (target: { id?: string | number; name: string; avatar?: string }) => void;
  showStoryTrayInChats?: boolean;
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

export const ListPanel: React.FC<ListPanelProps> = ({
  section,
  chats,
  groups,
  channels,
  communities,
  mail,
  stories,
  activeId,
  activeMailFolder,
  interfaceLang = 'en',
  onSelectChat,
  onSelectMailFolder,
  onToggleArchive,
  onToggleMute,
  onTogglePin,
  onToggleArchivePin,
  onDeleteChat,
  onUnarchiveAll,
  onMarkArchivedRead,
  onOpenArchiveSettings,
  onSimulateUnknownSender,
  onNewAction,
  onViewStory,
  onCreateStatus,
  onPreviewDp,
  showStoryTrayInChats = true,
  onToast,
  isHiddenOnMobile,
}) => {
  const [search, setSearch] = useState('');
  const [isArchiveHidden, setIsArchiveHidden] = useState<boolean>(false);
  const [viewingArchiveView, setViewingArchiveView] = useState<boolean>(false);
  const [contextMenuChatId, setContextMenuChatId] = useState<string | null>(null);
  const [archiveMenuOpen, setArchiveMenuOpen] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ id: string; message: string } | null>(null);
  // Live distance of the overscroll pull-down gesture, in px.
  const [pull, setPull] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pullStartRef = useRef<number | null>(null);
  const pullAxisRef = useRef<'none' | 'h' | 'v'>('none');
  const pullBuzzedRef = useRef(false);

  const PULL_THRESHOLD = 56;

  const rawTitle = viewingArchiveView
    ? 'Archived Chats'
    : section.charAt(0).toUpperCase() + section.slice(1);
  const title = getUIText(section, interfaceLang) !== section ? getUIText(section, interfaceLang) : rawTitle;
  const q = search.toLowerCase();

  const showStoriesBar = section === 'chats' && !viewingArchiveView && showStoryTrayInChats;
  const showFolderTabs = section === 'mail';

  const mailFolders: MailFolder[] = ['inbox', 'sent', 'drafts', 'spam', 'trash'];

  // Categorize archived vs active chats
  const archivedList = chats.filter((c) => c.archived);
  const activeChats = chats.filter((c) => !c.archived);

  // Unread count inside archive
  const archivedUnreadTotal = archivedList.reduce((acc, curr) => acc + (curr.unread || 0), 0);

  // The archive bar can only be pulled back into view when it is actually hidden.
  const canPullToReveal =
    section === 'chats' && !viewingArchiveView && isArchiveHidden && archivedList.length > 0;

  const revealArchiveBar = useCallback(() => {
    setIsArchiveHidden(false);
    haptic(18);
    onToast('Archived Chats folder revealed');
  }, [onToast]);

  const handleArchiveChat = useCallback(
    (room: ChatRoom) => {
      if (onToggleArchive) onToggleArchive(room.id);
      setSnack({ id: room.id, message: 'Chat archived' });
    },
    [onToggleArchive]
  );

  const handleUnarchiveChat = useCallback(
    (room: ChatRoom) => {
      if (onToggleArchive) onToggleArchive(room.id);
      onToast(`${room.name} moved back to your chat list`);
    },
    [onToggleArchive, onToast]
  );

  // --- Overscroll pull-down gesture on the list body -------------------------
  const onScrollPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canPullToReveal) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    pullStartRef.current = e.clientY;
    pullAxisRef.current = 'none';
    pullBuzzedRef.current = false;
  };

  const onScrollPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pullStartRef.current === null) return;
    const ddy = e.clientY - pullStartRef.current;

    if (pullAxisRef.current === 'none') {
      if (Math.abs(ddy) < 6) return;
      // Only downward drags count as a pull.
      pullAxisRef.current = ddy > 0 ? 'v' : 'h';
    }
    if (pullAxisRef.current !== 'v') return;

    // Rubber-band damping so the pull feels elastic rather than 1:1.
    const damped = Math.min(96, ddy * 0.55);
    setPull(damped);

    if (damped >= PULL_THRESHOLD && !pullBuzzedRef.current) {
      pullBuzzedRef.current = true;
      haptic(14);
    } else if (damped < PULL_THRESHOLD) {
      pullBuzzedRef.current = false;
    }
  };

  const onScrollPointerUp = () => {
    if (pullStartRef.current === null) return;
    const shouldReveal = pull >= PULL_THRESHOLD;
    pullStartRef.current = null;
    pullAxisRef.current = 'none';
    pullBuzzedRef.current = false;
    setPull(0);
    if (shouldReveal) revealArchiveBar();
  };

  // Trackpad / wheel overscroll at the very top also reveals the bar.
  const onScrollWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!canPullToReveal) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    if (e.deltaY < -18) revealArchiveBar();
  };

  // Batch preload all profile avatars into memory cache to eliminate flickering during lazy loading
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

  return (
    <div className={`list-panel ${isHiddenOnMobile ? 'hide' : ''}`}>
      {/* List Header */}
      <div className="list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewingArchiveView && (
            <button
              onClick={() => setViewingArchiveView(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'var(--text-0)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Back to all chats"
              title="Back to All Chats"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1>{viewingArchiveView ? 'Archived Chats' : title}</h1>
            <div className="brandline" />
          </div>
        </div>

        {viewingArchiveView && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-1)', fontWeight: 600 }}>
              {archivedList.length} archived
            </span>

            <button
              onClick={() => setArchiveMenuOpen((v) => !v)}
              style={{
                background: archiveMenuOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none',
                color: 'var(--text-1)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Archive options"
              aria-expanded={archiveMenuOpen}
              title="Archive options"
            >
              <MoreVertical size={16} />
            </button>

            {archiveMenuOpen && (
              <>
                {/* Click-away shield */}
                <div
                  onClick={() => setArchiveMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 150 }}
                />
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: '32px',
                    right: 0,
                    zIndex: 160,
                    minWidth: '186px',
                    background: 'var(--bg-1, #1F2C34)',
                    border: '1px solid var(--border, rgba(255,255,255,0.15))',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {[
                    {
                      icon: <ArchiveRestore size={14} />,
                      label: 'Unarchive All',
                      run: () => {
                        if (onUnarchiveAll) onUnarchiveAll();
                        setViewingArchiveView(false);
                      },
                    },
                    {
                      icon: <BellRing size={14} />,
                      label: 'Mark All as Read',
                      run: () => onMarkArchivedRead && onMarkArchivedRead(),
                    },
                    {
                      icon: <Archive size={14} />,
                      label: 'Archive Settings',
                      run: () => onOpenArchiveSettings && onOpenArchiveSettings(),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      role="menuitem"
                      onClick={() => {
                        setArchiveMenuOpen(false);
                        item.run();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-0)',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          placeholder={viewingArchiveView ? 'Search archived chats...' : getUIText('search', interfaceLang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
                  <CachedAvatar src={s.avatar} name={s.name} size={42} />
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
      <div
        className="list-scroll"
        ref={scrollRef}
        onPointerDown={onScrollPointerDown}
        onPointerMove={onScrollPointerMove}
        onPointerUp={onScrollPointerUp}
        onPointerCancel={onScrollPointerUp}
        onWheel={onScrollWheel}
      >
        {/* Overscroll pull-down affordance that brings the hidden archive bar back */}
        {canPullToReveal && (
          <div
            style={{
              height: `${pull}px`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              color: 'var(--accent-1, #00A884)',
              fontSize: '11.5px',
              fontWeight: 700,
              transition: pullStartRef.current === null ? 'height 220ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
          >
            <ChevronDown
              size={15}
              style={{
                transform: `rotate(${pull >= PULL_THRESHOLD ? 180 : 0}deg)`,
                transition: 'transform 160ms ease',
              }}
            />
            {pull >= PULL_THRESHOLD ? 'Release to show archive' : 'Pull to show archive'}
          </div>
        )}

        {/* ARCHIVED CHATS TOP BAR — swipe left to hide */}
        {section === 'chats' && !viewingArchiveView && archivedList.length > 0 && !isArchiveHidden && (
          <div className="swipe-host" style={{ padding: '0 2px 8px 2px' }}>
            <SwipeRow
              radius={14}
              threshold={80}
              actionLabel="HIDE"
              actionIcon={<EyeOff size={16} />}
              actionColor="#4A5C66"
              onSwipeLeft={() => {
                setIsArchiveHidden(true);
                onToast('Archive hidden — pull down at the top to bring it back');
              }}
            >
              <div
                style={{
                  background: 'var(--bg-2, rgba(255, 255, 255, 0.05))',
                  border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onClick={() => setViewingArchiveView(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <Archive size={17} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>
                      Archived Chats
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-1)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {archivedList.length} chat{archivedList.length > 1 ? 's' : ''} · swipe left to hide
                    </div>
                  </div>
                </div>

                {archivedUnreadTotal > 0 && (
                  <span
                    className="badge"
                    style={{
                      background: 'var(--accent-1, #00A884)',
                      color: '#fff',
                      fontSize: '11px',
                      flexShrink: 0,
                    }}
                    aria-label={`${archivedUnreadTotal} unread messages in archive`}
                  >
                    {archivedUnreadTotal}
                  </span>
                )}
              </div>
            </SwipeRow>
          </div>
        )}

        {/* 1. CHATS SECTION (MAIN LIST) */}
        {section === 'chats' && !viewingArchiveView && (
          activeChats
            .filter((r) => r.name.toLowerCase().includes(q))
            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
            .map((r) => (
              <div key={r.id} className="swipe-host">
                <SwipeRow
                  radius={13}
                  actionLabel="ARCHIVE"
                  actionIcon={<Archive size={16} />}
                  onSwipeLeft={() => handleArchiveChat(r)}
                >
              <div
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
                style={{ position: 'relative' }}
              >
                <CachedAvatar
                  src={r.avatar}
                  name={r.name}
                  size={48}
                  showOnlineBadge={true}
                  isOnline={r.online}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                />
                <div className="li-body">
                  <div className="li-top">
                    <span className="li-name">{r.name}</span>
                    <span className="li-time">{r.time}</span>
                  </div>
                  <div className="li-sub">
                    <span
                      className="li-msg"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      {r.pinned && <Pin size={12} style={{ flexShrink: 0, opacity: 0.85 }} />}
                      {r.muted && <BellOff size={12} style={{ flexShrink: 0, opacity: 0.85 }} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.last}
                      </span>
                    </span>
                    {!!r.unread && (
                      <span className={`badge ${r.muted ? 'mute' : ''}`}>
                        {r.unread}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Item Actions Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenuChatId(contextMenuChatId === r.id ? null : r.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-1)',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    opacity: 0.7,
                  }}
                  title="Chat Options"
                >
                  <MoreVertical size={15} />
                </button>

                {/* Inline Action Dropdown Menu */}
                {contextMenuChatId === r.id && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '36px',
                      zIndex: 100,
                      background: 'var(--bg-1, #1F2C34)',
                      border: '1px solid var(--border, rgba(255,255,255,0.15))',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      minWidth: '130px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      {
                        key: 'archive',
                        icon: <Archive size={13} />,
                        label: 'Archive Chat',
                        run: () => handleArchiveChat(r),
                      },
                      {
                        key: 'mute',
                        icon: r.muted ? <BellRing size={13} /> : <BellOff size={13} />,
                        label: r.muted ? 'Unmute' : 'Mute',
                        run: () => {
                          if (onToggleMute) onToggleMute(r.id);
                          onToast(r.muted ? `Unmuted ${r.name}` : `Muted ${r.name}`);
                        },
                      },
                      {
                        key: 'pin',
                        icon: r.pinned ? <PinOff size={13} /> : <Pin size={13} />,
                        label: r.pinned ? 'Unpin' : 'Pin to Top',
                        run: () => {
                          if (onTogglePin) onTogglePin(r.id);
                          onToast(r.pinned ? `Unpinned ${r.name}` : `Pinned ${r.name}`);
                        },
                      },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setContextMenuChatId(null);
                          item.run();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-0)',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
                </SwipeRow>
              </div>
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
                .filter((r) => r.name.toLowerCase().includes(q))
                .sort((a, b) => Number(b.archivedPinned) - Number(a.archivedPinned))
                .map((r) => (
                  <div key={r.id} className="swipe-host">
                    <SwipeRow
                      radius={13}
                      actionLabel="UNARCHIVE"
                      actionIcon={<ArchiveRestore size={16} />}
                      onSwipeLeft={() => handleUnarchiveChat(r)}
                    >
                      <div
                        className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                        onClick={() => onSelectChat(r.id)}
                        style={{ position: 'relative' }}
                      >
                        <CachedAvatar
                          src={r.avatar}
                          name={r.name}
                          size={48}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                          }}
                        />
                        <div className="li-body">
                          <div className="li-top">
                            <span className="li-name">{r.name}</span>
                            <span className="li-time">{r.time}</span>
                          </div>
                          <div className="li-sub">
                            <span
                              className="li-msg"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            >
                              {r.archivedPinned && (
                                <Pin size={12} style={{ flexShrink: 0, color: 'var(--accent-1, #00A884)' }} />
                              )}
                              {r.muted ? (
                                <BellOff size={12} style={{ flexShrink: 0, opacity: 0.85 }} />
                              ) : (
                                <BellRing size={12} style={{ flexShrink: 0, opacity: 0.85 }} />
                              )}
                              <span
                                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {r.last}
                              </span>
                            </span>
                            {!!r.unread && <span className="badge mute">{r.unread}</span>}
                          </div>
                        </div>

                        {/* Independent in-archive pin */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleArchivePin) onToggleArchivePin(r.id);
                            onToast(
                              r.archivedPinned
                                ? `Unpinned ${r.name} inside Archive`
                                : `Pinned ${r.name} inside Archive`
                            );
                          }}
                          style={{
                            background: r.archivedPinned ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
                            border: 'none',
                            color: r.archivedPinned ? 'var(--accent-1, #00A884)' : 'var(--text-1)',
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          aria-label={r.archivedPinned ? 'Unpin inside archive' : 'Pin inside archive'}
                          title={r.archivedPinned ? 'Unpin inside Archive' : 'Pin inside Archive'}
                        >
                          {r.archivedPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                      </div>
                    </SwipeRow>
                  </div>
                ))
            )}

            {/* Demo helper: exercise the auto-archive privacy rule */}
            {onSimulateUnknownSender && (
              <button
                onClick={onSimulateUnknownSender}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  width: '100%',
                  marginTop: '14px',
                  padding: '9px 12px',
                  background: 'transparent',
                  border: '1px dashed var(--border, rgba(255,255,255,0.18))',
                  borderRadius: '11px',
                  color: 'var(--text-1)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={13} />
                Simulate message from unknown sender
              </button>
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
            {/* My Status Header / Card */}
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
                    {/* Green Plus Badge if creating or adding */}
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
                        fontSize: '14px',
                        fontWeight: 'bold',
                        border: '2px solid var(--bg-1, #111b21)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                      }}
                      title="Add status update"
                    >
                      +
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
                      title="Create text or photo status"
                    >
                      📷
                    </button>
                  </div>
                </div>
              );
            })()}

            <div style={{ padding: '6px 16px', fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-1, #00A884)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent updates
            </div>

            {/* Contacts' Statuses */}
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

      {/* "Chat Archived" snackbar with UNDO */}
      {snack && (
        <ArchiveSnackbar
          message={snack.message}
          onUndo={() => {
            if (onToggleArchive) onToggleArchive(snack.id);
            setSnack(null);
          }}
          onDismiss={() => setSnack(null)}
        />
      )}

      {/* Floating Action Button */}
      <div className="new-fab" onClick={onNewAction} title="Create New">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
    </div>
  );
};
