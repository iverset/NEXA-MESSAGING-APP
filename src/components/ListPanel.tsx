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
  onNewAction: () => void;
  onToast: (msg: string) => void;
  isHiddenOnMobile: boolean;
}

function initials(name: string): string {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
  onNewAction,
  onToast,
  isHiddenOnMobile,
}) => {
  const [search, setSearch] = useState('');

  const rawTitle = section.charAt(0).toUpperCase() + section.slice(1);
  const title = getUIText(section, interfaceLang) !== section ? getUIText(section, interfaceLang) : rawTitle;
  const q = search.toLowerCase();

  const showStoriesBar = section === 'chats' || section === 'stories';
  const showFolderTabs = section === 'mail';

  const mailFolders: MailFolder[] = ['inbox', 'sent', 'drafts', 'spam', 'trash'];

  return (
    <div className={`list-panel ${isHiddenOnMobile ? 'hide' : ''}`}>
      <div className="list-header">
        <h1>{title}</h1>
        <div className="brandline" />
      </div>

      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          placeholder={getUIText('search', interfaceLang)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showStoriesBar && section !== 'stories' && (
        <div className="stories-bar">
          {stories.map((s) => (
            <div
              key={s.id}
              className="story"
              onClick={() => onToast('Story viewer — coming to life outside this preview 👀')}
            >
              <div className={`story-ring ${s.seen ? 'seen' : ''}`}>
                <div className="inner">
                  <div className="avatar-sm" style={{ background: s.avatar }}>
                    {s.mine ? '+' : initials(s.name)}
                  </div>
                </div>
              </div>
              <span>{s.mine ? 'Your story' : s.name}</span>
            </div>
          ))}
        </div>
      )}

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

      <div className="list-scroll">
        {section === 'chats' &&
          chats
            .filter((r) => r.name.toLowerCase().includes(q))
            .sort((a, b) => Number(b.pinned) - Number(a.pinned))
            .map((r) => (
              <div
                key={r.id}
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
              >
                <div className="avatar round" style={{ background: r.avatar }}>
                  {initials(r.name)}
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
                      {r.last}
                    </span>
                    {!!r.unread && (
                      <span className={`badge ${r.muted ? 'mute' : ''}`}>
                        {r.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

        {section === 'groups' &&
          groups
            .filter((r) => r.name.toLowerCase().includes(q))
            .map((r) => (
              <div
                key={r.id}
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
              >
                <div className="avatar" style={{ background: r.avatar }}>
                  {initials(r.name)}
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

        {section === 'channels' &&
          channels
            .filter((r) => r.name.toLowerCase().includes(q))
            .map((r) => (
              <div
                key={r.id}
                className={`list-item ${activeId === r.id ? 'selected' : ''}`}
                onClick={() => onSelectChat(r.id)}
              >
                <div className="avatar" style={{ background: r.avatar }}>
                  {initials(r.name)}
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

        {section === 'communities' &&
          communities
            .filter((r) => r.name.toLowerCase().includes(q))
            .map((r) => (
              <div
                key={r.id}
                className="list-item"
                onClick={() => onToast('Opening community — groups & channels inside would load here.')}
              >
                <div className="avatar" style={{ background: r.avatar }}>
                  {initials(r.name)}
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

        {section === 'mail' && (() => {
          const folderList = mail[activeMailFolder] || [];
          if (!folderList.length) {
            return <div className="section-empty">Nothing here yet.</div>;
          }
          return folderList.map((m) => (
            <div
              key={m.id}
              className="list-item"
              onClick={() => onToast('Opening mail thread with full CC/BCC & attachments view.')}
            >
              <div
                className="avatar round"
                style={{ background: getPaletteGrad(m.id.length) }}
              >
                {initials(m.from.replace('To: ', ''))}
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

        {section === 'stories' &&
          stories.map((s) => (
            <div
              key={s.id}
              className="list-item"
              onClick={() => onToast('Story viewer — coming to life outside this preview 👀')}
            >
              <div className={`story-ring ${s.seen ? 'seen' : ''}`} style={{ width: '48px', height: '48px' }}>
                <div className="inner">
                  <div className="avatar-sm" style={{ background: s.avatar }}>
                    {s.mine ? '+' : initials(s.name)}
                  </div>
                </div>
              </div>
              <div className="li-body">
                <div className="li-top">
                  <span className="li-name">{s.mine ? 'Your Story' : s.name}</span>
                </div>
                <div className="li-msg">
                  {s.mine ? 'Tap to add to your story' : 'Viewed within 24h · tap to view'}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="new-fab" onClick={onNewAction} title="Create New">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
    </div>
  );
};
