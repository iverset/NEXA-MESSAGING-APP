import React, { useState } from 'react';
import { AppSection, ChatRoom, MailFolder, MailItem, Story } from '../types';
import { getPaletteGrad } from '../data';
import { getUIText } from '../services/translator';

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
  onNewAction: () => void;
  onViewStory?: (story: Story) => void;
  onCreateStatus?: () => void;
  onPreviewDp?: (target: { id?: string | number; name: string; avatar?: string }) => void;
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
  onNewAction,
  onViewStory,
  onCreateStatus,
  onPreviewDp,
  onToast,
  isHiddenOnMobile,
}) => {
  const [search, setSearch] = useState('');
  const [isArchiveHidden, setIsArchiveHidden] = useState<boolean>(false);
  const [viewingArchiveView, setViewingArchiveView] = useState<boolean>(false);
  const [contextMenuChatId, setContextMenuChatId] = useState<string | null>(null);

  const rawTitle = viewingArchiveView
    ? 'Archived Chats'
    : section.charAt(0).toUpperCase() + section.slice(1);
  const title = getUIText(section, interfaceLang) !== section ? getUIText(section, interfaceLang) : rawTitle;
  const q = search.toLowerCase();

  const showStoriesBar = section === 'chats' && !viewingArchiveView;
  const showFolderTabs = section === 'mail';

  const mailFolders: MailFolder[] = ['inbox', 'sent', 'drafts', 'spam', 'trash'];

  // Categorize archived vs active chats
  const archivedList = chats.filter((c) => c.archived);
  const activeChats = chats.filter((c) => !c.archived);

  // Unread count inside archive
  const archivedUnreadTotal = archivedList.reduce((acc, curr) => acc + (curr.unread || 0), 0);

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
                fontSize: '14px',
                fontWeight: 700,
              }}
              title="Back to All Chats"
            >
              ←
            </button>
          )}
          <div>
            <h1>{viewingArchiveView ? 'Archived Chats' : title}</h1>
            <div className="brandline" />
          </div>
        </div>

        {viewingArchiveView && (
          <span style={{ fontSize: '12px', color: 'var(--text-1)', fontWeight: 600 }}>
            {archivedList.length} archived
          </span>
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
              onClick={() => onToast('Story viewer — active session preview 👀')}
            >
              <div className={`story-ring ${s.seen ? 'seen' : ''}`}>
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
        {section === 'chats' && !viewingArchiveView && archivedList.length > 0 && (
          <div style={{ padding: '0 10px 8px 10px' }}>
            {!isArchiveHidden ? (
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
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
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
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    📥
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>
                      Archived Chats
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>
                      {archivedList.length} chat{archivedList.length > 1 ? 's' : ''} stored in cloud archive
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
                  {/* Swipe left to hide bar gesture trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsArchiveHidden(true);
                      onToast('Archived Chats folder hidden. Drag/pull down or tap to reveal.');
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
                    title="Swipe left / Hide archive bar"
                  >
                    Swipe Left / Hide 👈
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
                  padding: '6px 12px',
                  textAlign: 'center',
                  fontSize: '11.5px',
                  color: 'var(--accent-1, #00A884)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                👇 Pull / Click to reveal Archived Chats ({archivedList.length})
              </div>
            )}
          </div>
        )}

        {/* 1. CHATS SECTION (MAIN LIST) */}
        {section === 'chats' && !viewingArchiveView && (
          activeChats
            .filter((r) => r.name.toLowerCase().includes(q))
            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
            .map((r) => (
              <div
                key={r.id}
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
                style={{ position: 'relative' }}
              >
                <div
                  className="avatar round"
                  style={{
                    background: !(r.avatar?.startsWith('http') || r.avatar?.startsWith('data:')) ? r.avatar : undefined,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                  title={`View ${r.name}'s profile photo`}
                >
                  {renderAvatar(r.avatar, r.name)}
                  {r.online && <div className="online-dot" />}
                </div>
                <div className="li-body">
                  <div className="li-top">
                    <span className="li-name">{r.name}</span>
                    <span className="li-time">{r.time}</span>
                  </div>
                  <div className="li-sub">
                    <span className="li-msg">
                      {r.pinned ? '📌 ' : ''}
                      {r.muted ? '🔇 ' : ''}
                      {r.last}
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
                  ⋮
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
                    <button
                      onClick={() => {
                        setContextMenuChatId(null);
                        if (onToggleArchive) onToggleArchive(r.id);
                        onToast(`Archived ${r.name}`);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-0)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      📥 Archive Chat
                    </button>

                    <button
                      onClick={() => {
                        setContextMenuChatId(null);
                        if (onToggleMute) onToggleMute(r.id);
                        onToast(r.muted ? `Unmuted ${r.name}` : `Muted ${r.name}`);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-0)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {r.muted ? '🔔 Unmute' : '🔇 Mute'}
                    </button>

                    <button
                      onClick={() => {
                        setContextMenuChatId(null);
                        if (onTogglePin) onTogglePin(r.id);
                        onToast(r.pinned ? `Unpinned ${r.name}` : `Pinned ${r.name}`);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-0)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {r.pinned ? '📍 Unpin' : '📌 Pin to Top'}
                    </button>
                  </div>
                )}
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
                  <div
                    key={r.id}
                    className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                    onClick={() => onSelectChat(r.id)}
                    style={{ position: 'relative' }}
                  >
                    <div
                      className="avatar round"
                      style={{
                        background: !(r.avatar?.startsWith('http') || r.avatar?.startsWith('data:')) ? r.avatar : undefined,
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                      }}
                      title={`View ${r.name}'s profile photo`}
                    >
                      {renderAvatar(r.avatar, r.name)}
                    </div>
                    <div className="li-body">
                      <div className="li-top">
                        <span className="li-name">{r.name}</span>
                        <span className="li-time">{r.time}</span>
                      </div>
                      <div className="li-sub">
                        <span className="li-msg">
                          {r.archivedPinned ? '📌 ' : ''}
                          {r.muted ? '🔇 (Muted - Stays Archived) ' : '🔔 (Unmuted - Auto Unarchives on Msg) '}
                          {r.last}
                        </span>
                        {!!r.unread && <span className="badge mute">{r.unread}</span>}
                      </div>
                    </div>

                    {/* Quick Unarchive & Pin inside Archive buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleArchivePin) onToggleArchivePin(r.id);
                          onToast(r.archivedPinned ? `Unpinned ${r.name} inside Archive` : `Pinned ${r.name} inside Archive`);
                        }}
                        style={{
                          background: r.archivedPinned ? 'rgba(0, 168, 132, 0.2)' : 'rgba(255,255,255,0.06)',
                          border: 'none',
                          color: r.archivedPinned ? 'var(--accent-1, #00A884)' : 'var(--text-1)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                        title="Pin inside Archive"
                      >
                        📌
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleArchive) onToggleArchive(r.id);
                          onToast(`Unarchived ${r.name} back to main chat list`);
                        }}
                        style={{
                          background: 'rgba(0, 168, 132, 0.15)',
                          border: 'none',
                          color: 'var(--accent-1, #00A884)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Unarchive Chat"
                      >
                        Unarchive
                      </button>
                    </div>
                  </div>
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
                <div
                  className="avatar round"
                  style={{
                    background: !(r.avatar?.startsWith('http') || r.avatar?.startsWith('data:')) ? r.avatar : undefined,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                  title={`View ${r.name}'s profile photo`}
                >
                  {renderAvatar(r.avatar, r.name)}
                </div>
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
                <div
                  className="avatar round"
                  style={{
                    background: !(r.avatar?.startsWith('http') || r.avatar?.startsWith('data:')) ? r.avatar : undefined,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                  title={`View ${r.name}'s profile photo`}
                >
                  {renderAvatar(r.avatar, r.name)}
                </div>
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
                <div
                  className="avatar round"
                  style={{
                    background: !(r.avatar?.startsWith('http') || r.avatar?.startsWith('data:')) ? r.avatar : undefined,
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPreviewDp) onPreviewDp({ id: r.id, name: r.name, avatar: r.avatar });
                  }}
                  title={`View ${r.name}'s profile photo`}
                >
                  {renderAvatar(r.avatar, r.name)}
                </div>
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

      {/* Floating Action Button */}
      <div className="new-fab" onClick={onNewAction} title="Create New">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
    </div>
  );
};
