import React, { useState } from 'react';
import { ChatRoom, UserProfile, AdvancedSettingsState, AvatarItem, ThemeOption } from '../types';
import { THEMES, ACCENTS } from '../data';
import { FONT_CATALOG } from '../data/fontsCatalog';
import { SUPPORTED_LANGUAGES, getUIText } from '../services/translator';
import { ProfilePicturePickerModal, ProfilePictureSelection } from './ProfilePicturePickerModal';

interface DrawerProps {
  isOpen: boolean;
  mode: 'profile' | 'contact' | 'settings';
  activeRoom: ChatRoom | null;
  profile: UserProfile;
  advSettings: AdvancedSettingsState;
  currentTheme: string;
  toggleStates: Record<string, boolean>;
  selectedRadioStates: Record<string, number>;
  bubbleRadius: number;
  fontScale: number;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUpdateAdvSettings: (updated: Partial<AdvancedSettingsState>) => void;
  onSelectTheme: (k: ThemeOption['k']) => void;
  onSelectAccent: (i: number) => void;
  onSetBubbleRadius: (r: number) => void;
  onSetFontScale: (s: number) => void;
  onToggleChange: (key: string, val: boolean) => void;
  onRadioChange: (key: string, idx: number) => void;
  onToast: (msg: string) => void;
  onOpenFontSelector?: () => void;
  onOpenFullScreenDp?: (target: { name: string; avatar?: string }) => void;
}

function initials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  mode,
  activeRoom,
  profile,
  advSettings,
  currentTheme,
  toggleStates,
  selectedRadioStates,
  bubbleRadius,
  fontScale,
  onClose,
  onUpdateProfile,
  onUpdateAdvSettings,
  onSelectTheme,
  onSelectAccent,
  onSetBubbleRadius,
  onSetFontScale,
  onToggleChange,
  onRadioChange,
  onToast,
  onOpenFontSelector,
  onOpenFullScreenDp,
}) => {
  const [settingsStack, setSettingsStack] = useState<string[]>(['home']);
  const [activeAvatarIdx, setActiveAvatarIdx] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'html' | 'json'>('html');
  const [proxyPing, setProxyPing] = useState<string | null>(null);
  const [langSearchQuery, setLangSearchQuery] = useState<string>('');

  const goSettings = (page: string) => {
    setSettingsStack((prev) => [...prev, page]);
  };

  const backSettings = () => {
    setSettingsStack((prev) => {
      if (prev.length <= 1) {
        onClose();
        return ['home'];
      }
      return prev.slice(0, prev.length - 1);
    });
  };

  const currentPage = settingsStack[settingsStack.length - 1] || 'home';

  const actionCell = (icon: string, label: string) => (
    <div key={label} className="action-cell" onClick={() => onToast(label)}>
      <span style={{ fontSize: '17px' }}>{icon}</span>
      {label}
    </div>
  );

  const catRow = (icon: string, label: string, sub: string, onClick: () => void) => (
    <div key={label} className="settings-cat-row" onClick={onClick}>
      <div className="cat-ic">{icon}</div>
      <div className="cat-body">
        <div className="cat-label">{label}</div>
        {sub ? <div className="cat-sub">{sub}</div> : null}
      </div>
      <div className="chev">›</div>
    </div>
  );

  const toggleRow = (catId: string, itemId: string, idx: number, label: string, defaultOn: boolean, hint?: string) => {
    const key = `${catId}.${itemId}.${idx}`;
    const on = key in toggleStates ? toggleStates[key] : defaultOn;
    return (
      <div key={key} className="toggle-row">
        <span>
          {label}
          {hint ? <div className="cat-sub">{hint}</div> : null}
        </span>
        <div className={`toggle ${on ? 'on' : ''}`} onClick={() => onToggleChange(key, !on)} />
      </div>
    );
  };

  const radioList = (catId: string, itemId: string, options: string[], defaultSel: number) => {
    const key = `${catId}.${itemId}.sel`;
    const sel = key in selectedRadioStates ? selectedRadioStates[key] : defaultSel;
    return (
      <div className="setting-group">
        {options.map((o, idx) => (
          <div
            key={idx}
            className="info-row"
            style={{ cursor: 'pointer' }}
            onClick={() => onRadioChange(key, idx)}
          >
            <span>{o}</span>
            <span style={{ color: 'var(--accent-1)' }}>{sel === idx ? '✓' : ''}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render clickable links and mentions in Bio
  const renderFormattedBio = (bioText: string) => {
    if (!bioText) return <span style={{ opacity: 0.5, fontStyle: 'italic' }}>No bio set.</span>;
    const parts = bioText.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (/^@[a-zA-Z0-9_]{3,}$/.test(part)) {
        return (
          <span
            key={idx}
            style={{ color: 'var(--accent-1)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => onToast(`Opening profile for ${part}`)}
          >
            {part}
          </span>
        );
      }
      if (/^https?:\/\/[^\s]+/.test(part)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-1)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Avatar Management & Picker Modal
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  const avatars = profile.avatars && profile.avatars.length > 0 ? profile.avatars : [
    { id: 'av1', url: 'linear-gradient(135deg, #FF9A6F, #FF5376)', isVideo: false, createdAt: 'Today' }
  ];

  const safeAvatarIdx = Math.min(activeAvatarIdx, avatars.length - 1);
  const currentAvatar = avatars[safeAvatarIdx] || avatars[0];

  const handleSaveProfilePicture = (selection: ProfilePictureSelection) => {
    const newAv: AvatarItem = {
      id: 'av_' + Date.now(),
      url: selection.url,
      createdAt: 'Just now',
    };
    // WhatsApp style DP: single active profile photo
    onUpdateProfile({ avatars: [newAv], activeAvatarId: newAv.id });
    setActiveAvatarIdx(0);
    setIsPickerModalOpen(false);
    onToast('Profile picture updated!');
  };

  const handleSetMainAvatar = () => {
    onUpdateProfile({ activeAvatarId: currentAvatar.id });
    onToast('Set as main profile photo!');
  };

  const handleTogglePublicPhoto = () => {
    const isPublic = profile.publicAvatarId === currentAvatar.id;
    onUpdateProfile({ publicAvatarId: isPublic ? undefined : currentAvatar.id });
    onToast(isPublic ? 'Public photo removed' : 'Set as Public Photo for everyone!');
  };

  const handleDeleteCurrentAvatar = () => {
    if (avatars.length <= 1) {
      onToast('You must keep at least one profile avatar.');
      return;
    }
    const updated = avatars.filter((a) => a.id !== currentAvatar.id);
    onUpdateProfile({ avatars: updated, activeAvatarId: updated[0].id });
    setActiveAvatarIdx(0);
    onToast('Avatar deleted');
  };

  // Export process simulator
  const startExportData = () => {
    setIsExporting(true);
    setExportProgress(10);
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            onToast(`Chat history exported as nexa_export.${exportFormat}`);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Contact Info View
  if (mode === 'contact') {
    const room = activeRoom || { name: 'Amara Osei', avatar: 'linear-gradient(135deg,#6FF5C6,#4C8DFF)', online: true };

    return (
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>Profile</h3>
          <div className="icon-btn" onClick={onClose}>✕</div>
        </div>
        <div className="drawer-body">
          <div className="profile-hero">
            <div
              className="avatar round"
              style={{
                background: !(room.avatar?.startsWith('http') || room.avatar?.startsWith('data:')) ? room.avatar : undefined,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => onOpenFullScreenDp?.({ name: room.name, avatar: room.avatar })}
              title="Tap to view full screen profile photo"
            >
              {room.avatar?.startsWith('http') || room.avatar?.startsWith('data:') ? (
                <img src={room.avatar} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials(room.name)
              )}
            </div>
            <h2>{room.name}</h2>
            <div className="uname">@{room.name.toLowerCase().replace(/\s+/g, '_')}</div>
            <div className="pron-badge">{room.members ? `${room.members} members` : 'she/her'}</div>
            <p className="bio">
              {room.members
                ? `Group for ${room.name.toLowerCase()}.`
                : 'Building things that connect people. Coffee-first mornings.'}
            </p>
          </div>

          <div className="action-grid">
            {actionCell('💬', 'Message')}
            {actionCell('📞', 'Call')}
            {actionCell('🎥', 'Video')}
            {actionCell('⭐', 'Favorite')}
          </div>

          <div className="action-grid">
            {actionCell('📌', 'Pin')}
            {actionCell('🚩', 'Report')}
            {actionCell('⛔', 'Block')}
            {actionCell('⋯', 'More')}
          </div>

          <div className="setting-group">
            <h4>Info</h4>
            <div className="info-row">
              <span>Shared groups</span>
              <span>3</span>
            </div>
            <div className="info-row">
              <span>Shared communities</span>
              <span>1</span>
            </div>
            <div className="info-row">
              <span>Last seen</span>
              <span>{room.online ? 'online now' : '2h ago'}</span>
            </div>
          </div>

          <div className="danger" onClick={() => onToast('User blocked')}>
            Block user
          </div>
        </div>
      </div>
    );
  }

  // Render Settings pages
  const renderSettingsContent = () => {
    if (currentPage === 'home') {
      return (
        <>
          <div className="profile-hero" style={{ cursor: 'pointer' }} onClick={() => goSettings('profile')}>
            <div
              className="avatar round"
              style={{
                background: currentAvatar.url.startsWith('linear') ? currentAvatar.url : 'var(--bg-2, #000)',
                width: '80px',
                height: '80px',
                fontSize: '26px',
                margin: '0 auto',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {currentAvatar.isVideo && currentAvatar.videoUrl ? (
                <video src={currentAvatar.videoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : currentAvatar.url && !currentAvatar.url.startsWith('linear') ? (
                <img src={currentAvatar.url} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials(profile.name)
              )}
            </div>
            <h2 style={{ marginTop: '10px' }}>{profile.name || 'Your Name'}</h2>
            <div className="uname">@{profile.username || 'username'}</div>
          </div>

          <div className="settings-cat-list">
            {catRow('👤', 'My Profile', 'Photo/Video avatars, name, handle, bio', () => goSettings('profile'))}
            {catRow('🔔', 'Notifications and Sounds', 'Alerts, vibrations, badges', () => goSettings('notifications'))}
            {catRow('🔒', 'Privacy and Security', 'Last seen, phone & passcode', () => goSettings('privacy'))}
            {catRow('💾', 'Data and Storage', 'Auto-download, cache, directory', () => goSettings('data'))}
            {catRow('🎨', 'Appearance', 'Theme, chat colors, text size', () => goSettings('appearance'))}
            {catRow('🌐', 'Language', 'English', () => goSettings('language'))}
            {catRow('🎉', 'Stickers and Emoji', 'Packs & reactions', () => goSettings('stickers'))}
            {catRow('💻', 'Devices', 'Active sessions & linked apps', () => goSettings('devices'))}
            {catRow('🗂️', 'Folders', 'Chat organization', () => goSettings('folders'))}
            {catRow('⚙️', 'Advanced', 'Proxy, startup, scaling, export data', () => goSettings('advanced'))}
            {catRow('❓', 'Help', 'FAQ & support', () => goSettings('help'))}
          </div>
        </>
      );
    }

    if (currentPage === 'profile') {
      return (
        <>
          {/* WhatsApp Style Profile Picture (DP) */}
          <div className="setting-group" style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto' }}>
              <div
                className="avatar round"
                style={{
                  background: currentAvatar.url.startsWith('linear') ? currentAvatar.url : 'var(--bg-2, #000)',
                  width: '110px',
                  height: '110px',
                  fontSize: '36px',
                  overflow: 'hidden',
                  margin: '0 auto',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                  cursor: 'pointer',
                  position: 'relative',
                  border: '3px solid var(--accent-1, #00A884)',
                }}
                onClick={() => setIsPickerModalOpen(true)}
                title="Change Profile Photo"
              >
                {currentAvatar.isVideo && currentAvatar.videoUrl ? (
                  <video src={currentAvatar.videoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : currentAvatar.url && !currentAvatar.url.startsWith('linear') ? (
                  <img src={currentAvatar.url} alt="Profile Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials(profile.name)
                )}
              </div>

              {/* WhatsApp Style Camera Badge Button */}
              <button
                onClick={() => setIsPickerModalOpen(true)}
                title="Change Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--accent-1, #00A884)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  cursor: 'pointer',
                  border: '2px solid var(--bg-1, #111B21)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                }}
              >
                📷
              </button>
            </div>

            <div style={{ marginTop: '14px' }}>
              <button
                onClick={() => setIsPickerModalOpen(true)}
                style={{
                  background: 'rgba(0, 168, 132, 0.15)',
                  color: 'var(--accent-1, #00A884)',
                  border: '1px solid var(--accent-1, #00A884)',
                  padding: '7px 18px',
                  borderRadius: '18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📷</span> Change Profile Photo
              </button>
            </div>
            <p className="cat-sub" style={{ marginTop: '10px' }}>
              Your profile photo is visible to your contacts across chats and groups.
            </p>
          </div>

          {/* First & Last Name */}
          <div className="setting-group">
            <h4>Display Name</h4>
            <div className="field-row">
              <label>
                First Name <span style={{ color: '#FF5376' }}>*</span>
              </label>
              <input
                className="field-input"
                placeholder="First Name (Required)"
                value={profile.firstName || ''}
                onChange={(e) => {
                  const f = e.target.value;
                  const full = `${f} ${profile.lastName || ''}`.trim();
                  onUpdateProfile({ firstName: f, name: full || f });
                }}
              />
            </div>
            <div className="field-row">
              <label>
                Last Name <span style={{ opacity: 0.6 }}>(Optional)</span>
              </label>
              <input
                className="field-input"
                placeholder="Last Name (Optional)"
                value={profile.lastName || ''}
                onChange={(e) => {
                  const l = e.target.value;
                  const full = `${profile.firstName || ''} ${l}`.trim();
                  onUpdateProfile({ lastName: l, name: full });
                }}
              />
            </div>
            <p className="cat-sub" style={{ marginTop: '4px' }}>
              Only First Name is required. Display names do not need to be unique.
            </p>
          </div>

          {/* Username */}
          <div className="setting-group">
            <h4>Username (@handle)</h4>
            <div className="field-row">
              <label>Username</label>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ padding: '0 8px', color: 'var(--accent-1)', fontWeight: 600 }}>@</span>
                <input
                  className="field-input"
                  style={{ flex: 1 }}
                  placeholder="username"
                  value={profile.username || ''}
                  onChange={(e) => {
                    const u = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    onUpdateProfile({ username: u });
                  }}
                />
              </div>
            </div>

            {profile.username && profile.username.length < 5 && (
              <div style={{ fontSize: '11.5px', color: '#FF9A6F', marginTop: '4px' }}>
                ⚠️ Username must be at least 5 characters long.
              </div>
            )}

            {profile.username && profile.username.length >= 5 && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Direct Share Link</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--accent-1)', fontWeight: 600, wordBreak: 'break-all' }}>
                    https://nexa.me/{profile.username}
                  </span>
                  <button
                    style={{
                      background: 'var(--accent-1)',
                      color: '#000',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(`https://nexa.me/${profile.username}`);
                      onToast('Direct link copied to clipboard!');
                    }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            <p className="cat-sub" style={{ marginTop: '6px' }}>
              Anyone opening this link can launch a chat with you. Removing your username hides your profile from global search.
            </p>
          </div>

          {/* Bio */}
          <div className="setting-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ margin: 0 }}>Bio</h4>
              <span
                style={{
                  fontSize: '11px',
                  color: (profile.bio || '').length > 70 ? '#FF5376' : 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                }}
              >
                {(profile.bio || '').length}/70
              </span>
            </div>
            <textarea
              className="field-input"
              rows={2}
              maxLength={70}
              placeholder="Tell others a bit about yourself..."
              value={profile.bio || ''}
              onChange={(e) => onUpdateProfile({ bio: e.target.value })}
            />

            <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px' }}>Bio Clickable Preview:</div>
              <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{renderFormattedBio(profile.bio)}</div>
            </div>
            <p className="cat-sub" style={{ marginTop: '6px' }}>
              Type @username or web links (https://...) to make them clickable.
            </p>
          </div>
        </>
      );
    }

    if (currentPage === 'advanced') {
      return (
        <>
          <div className="setting-group">
            <h4>Advanced Settings</h4>
            {catRow('💾', 'Data & Automatic Media Downloads', 'Size limits & network modes', () => goSettings('data'))}
            {catRow('🌐', 'Network & Proxy', 'SOCKS5, MTProto & IPv6', () => goSettings('proxy'))}
            {catRow('🖥️', 'System Integration', 'Startup launch, system tray & flash', () => goSettings('system'))}
            {catRow('⚡', 'Performance & Graphics', 'UI scaling & Hardware acceleration', () => goSettings('performance'))}
            {catRow('📤', 'Export Chat Data', 'Export chats & media to HTML/JSON', () => goSettings('export'))}
          </div>
        </>
      );
    }

    if (currentPage === 'data') {
      return (
        <>
          <div className="setting-group">
            <h4>Automatic Media Downloads</h4>
            <div className="toggle-row">
              <span>Private Chats</span>
              <div
                className={`toggle ${advSettings.autoDownloadPrivate ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ autoDownloadPrivate: !advSettings.autoDownloadPrivate })}
              />
            </div>
            <div className="toggle-row">
              <span>Groups</span>
              <div
                className={`toggle ${advSettings.autoDownloadGroups ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ autoDownloadGroups: !advSettings.autoDownloadGroups })}
              />
            </div>
            <div className="toggle-row">
              <span>Channels</span>
              <div
                className={`toggle ${advSettings.autoDownloadChannels ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ autoDownloadChannels: !advSettings.autoDownloadChannels })}
              />
            </div>
          </div>

          <div className="setting-group">
            <h4>Media Size Limits</h4>
            <div className="slider-label">
              <span>Max Photo Size</span>
              <span>{advSettings.maxPhotoSizeMB} MB</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={advSettings.maxPhotoSizeMB}
              className="slider"
              onChange={(e) => onUpdateAdvSettings({ maxPhotoSizeMB: Number(e.target.value) })}
            />

            <div className="slider-label" style={{ marginTop: '12px' }}>
              <span>Max Video Size</span>
              <span>{advSettings.maxVideoSizeMB} MB</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              value={advSettings.maxVideoSizeMB}
              className="slider"
              onChange={(e) => onUpdateAdvSettings({ maxVideoSizeMB: Number(e.target.value) })}
            />
          </div>

          <div className="setting-group">
            <h4>Autoplay & Streaming</h4>
            <div className="toggle-row">
              <span>Autoplay GIFs</span>
              <div
                className={`toggle ${advSettings.autoplayGIFs ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ autoplayGIFs: !advSettings.autoplayGIFs })}
              />
            </div>
            <div className="toggle-row">
              <span>Autoplay Videos</span>
              <div
                className={`toggle ${advSettings.autoplayVideos ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ autoplayVideos: !advSettings.autoplayVideos })}
              />
            </div>
            <div className="toggle-row">
              <span>Stream Media before download</span>
              <div
                className={`toggle ${advSettings.streamMedia ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ streamMedia: !advSettings.streamMedia })}
              />
            </div>
          </div>

          <div className="setting-group">
            <h4>Storage & Download Path</h4>
            <div className="field-row">
              <label>Download Path</label>
              <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                <input
                  className="field-input"
                  style={{ flex: 1 }}
                  value={advSettings.downloadPath}
                  onChange={(e) => onUpdateAdvSettings({ downloadPath: e.target.value })}
                />
                <button
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '0 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                  onClick={() => onToast('Browse folder dialog opened')}
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="toggle-row" style={{ marginTop: '8px' }}>
              <span>Ask where to save each file</span>
              <div
                className={`toggle ${advSettings.askWhereToSave ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ askWhereToSave: !advSettings.askWhereToSave })}
              />
            </div>
          </div>
        </>
      );
    }

    if (currentPage === 'proxy') {
      return (
        <>
          <div className="setting-group">
            <h4>Proxy Type</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {(['none', 'socks5', 'mtproto'] as const).map((type) => (
                <button
                  key={type}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: '8px',
                    border: advSettings.proxyType === type ? '1px solid var(--accent-1)' : '1px solid rgba(255,255,255,0.1)',
                    background: advSettings.proxyType === type ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                    color: advSettings.proxyType === type ? '#000' : '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                  onClick={() => onUpdateAdvSettings({ proxyType: type })}
                >
                  {type === 'none' ? 'System Default' : type.toUpperCase()}
                </button>
              ))}
            </div>

            {advSettings.proxyType !== 'none' && (
              <>
                <div className="field-row">
                  <label>Server IP / Host</label>
                  <input
                    className="field-input"
                    value={advSettings.proxyServer}
                    onChange={(e) => onUpdateAdvSettings({ proxyServer: e.target.value })}
                  />
                </div>
                <div className="field-row">
                  <label>Port</label>
                  <input
                    className="field-input"
                    value={advSettings.proxyPort}
                    onChange={(e) => onUpdateAdvSettings({ proxyPort: e.target.value })}
                  />
                </div>
                <div className="field-row">
                  <label>Username (Optional)</label>
                  <input
                    className="field-input"
                    value={advSettings.proxyUsername || ''}
                    onChange={(e) => onUpdateAdvSettings({ proxyUsername: e.target.value })}
                  />
                </div>
                <div className="field-row">
                  <label>Password (Optional)</label>
                  <input
                    type="password"
                    className="field-input"
                    value={advSettings.proxyPassword || ''}
                    onChange={(e) => onUpdateAdvSettings({ proxyPassword: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="toggle-row" style={{ marginTop: '10px' }}>
              <span>Try IPv6 connection</span>
              <div
                className={`toggle ${advSettings.useIPv6 ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ useIPv6: !advSettings.useIPv6 })}
              />
            </div>

            <div className="toggle-row">
              <span>Enable Proxy</span>
              <div
                className={`toggle ${advSettings.proxyEnabled ? 'on' : ''}`}
                onClick={() => onUpdateAdvSettings({ proxyEnabled: !advSettings.proxyEnabled })}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setProxyPing('Pinging server...');
                  setTimeout(() => setProxyPing('Connected • Ping: 28ms'), 800);
                }}
              >
                Test Proxy Connection
              </button>
              {proxyPing && (
                <div style={{ marginTop: '6px', fontSize: '12px', textAlign: 'center', color: '#6FF5C6', fontWeight: 600 }}>
                  {proxyPing}
                </div>
              )}
            </div>
          </div>
        </>
      );
    }

    if (currentPage === 'system') {
      return (
        <div className="setting-group">
          <h4>System Integration</h4>
          <div className="toggle-row">
            <span>Launch NEXA on system startup</span>
            <div
              className={`toggle ${advSettings.launchOnStartup ? 'on' : ''}`}
              onClick={() => onUpdateAdvSettings({ launchOnStartup: !advSettings.launchOnStartup })}
            />
          </div>
          <div className="toggle-row">
            <span>Minimize to system tray on close</span>
            <div
              className={`toggle ${advSettings.minimizeToTray ? 'on' : ''}`}
              onClick={() => onUpdateAdvSettings({ minimizeToTray: !advSettings.minimizeToTray })}
            />
          </div>
          <div className="toggle-row">
            <span>Taskbar flash alerts for unread messages</span>
            <div
              className={`toggle ${advSettings.taskbarFlash ? 'on' : ''}`}
              onClick={() => onUpdateAdvSettings({ taskbarFlash: !advSettings.taskbarFlash })}
            />
          </div>
        </div>
      );
    }

    if (currentPage === 'performance') {
      return (
        <div className="setting-group">
          <h4>Performance & Graphics</h4>
          <div className="slider-label">
            <span>Interface Scaling</span>
            <span>{advSettings.interfaceScale}%</span>
          </div>
          <input
            type="range"
            min="100"
            max="150"
            step="5"
            value={advSettings.interfaceScale}
            className="slider"
            onChange={(e) => onUpdateAdvSettings({ interfaceScale: Number(e.target.value) })}
          />

          <div className="toggle-row" style={{ marginTop: '14px' }}>
            <span>Hardware Acceleration</span>
            <div
              className={`toggle ${advSettings.hardwareAccel ? 'on' : ''}`}
              onClick={() => onUpdateAdvSettings({ hardwareAccel: !advSettings.hardwareAccel })}
            />
          </div>

          <div className="toggle-row">
            <span>Reduce animations</span>
            <div
              className={`toggle ${advSettings.reduceAnimations ? 'on' : ''}`}
              onClick={() => onUpdateAdvSettings({ reduceAnimations: !advSettings.reduceAnimations })}
            />
          </div>
        </div>
      );
    }

    if (currentPage === 'export') {
      return (
        <div className="setting-group">
          <h4>Export Chat History & Media</h4>
          <p className="cat-sub" style={{ marginBottom: '12px' }}>
            Download a full archive of your account info, message logs, and media files.
          </p>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Format:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: exportFormat === 'html' ? '1px solid var(--accent-1)' : '1px solid rgba(255,255,255,0.1)',
                  background: exportFormat === 'html' ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                  color: exportFormat === 'html' ? '#000' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onClick={() => setExportFormat('html')}
              >
                HTML (Browser Viewable)
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: exportFormat === 'json' ? '1px solid var(--accent-1)' : '1px solid rgba(255,255,255,0.1)',
                  background: exportFormat === 'json' ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                  color: exportFormat === 'json' ? '#000' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onClick={() => setExportFormat('json')}
              >
                JSON (Machine Readable)
              </button>
            </div>
          </div>

          {isExporting ? (
            <div style={{ margin: '16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Exporting chats & media...</span>
                <span>{exportProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${exportProgress}%`, height: '100%', background: 'var(--accent-1)', transition: 'width 0.3s' }} />
              </div>
            </div>
          ) : (
            <div className="settings-action-btn" style={{ marginTop: '14px' }} onClick={startExportData}>
              Start Data Export
            </div>
          )}
        </div>
      );
    }

    if (currentPage === 'appearance') {
      return (
        <>
          <div className="setting-group">
            <h4>Theme</h4>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <div
                  key={t.k}
                  className={`theme-swatch ${currentTheme === t.k ? 'active' : ''}`}
                  onClick={() => onSelectTheme(t.k)}
                >
                  <div className="swatch-preview">
                    <div style={{ background: t.c[0] }} />
                    <div style={{ background: t.c[2] }} />
                    <div style={{ background: t.c[1] }} />
                  </div>
                  <p>{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <h4>Accent color</h4>
            <div className="accent-row">
              {ACCENTS.map((a, i) => {
                const [c1, c2] = a.split(',');
                return (
                  <div
                    key={i}
                    className={`accent-dot ${i === 0 ? 'active' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    onClick={() => onSelectAccent(i)}
                  />
                );
              })}
            </div>
          </div>

          <div className="setting-group">
            <h4>Chat bubbles</h4>
            <div className="slider-label">
              <span>Corner roundness</span>
              <span>{bubbleRadius}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="26"
              value={bubbleRadius}
              className="slider"
              onChange={(e) => onSetBubbleRadius(Number(e.target.value))}
            />
          </div>

          <div className="setting-group">
            <h4>Text size</h4>
            <div className="slider-label">
              <span>Font scale</span>
              <span>{Math.round(fontScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="85"
              max="130"
              value={Math.round(fontScale * 100)}
              className="slider"
              onChange={(e) => onSetFontScale(Number(e.target.value) / 100)}
            />
          </div>

          {/* Custom Font Selector */}
          <div className="setting-group">
            <h4>Typography & Font Style</h4>
            {(() => {
              const currentFontId = advSettings.selectedFontId || 'inter';
              const fontObj = FONT_CATALOG.find((f) => f.id === currentFontId) || FONT_CATALOG[28];
              return (
                <div
                  onClick={() => {
                    if (onOpenFontSelector) onOpenFontSelector();
                    else onToast('Opening Font Selector...');
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--bg-2, rgba(255,255,255,0.05))',
                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-0)' }}>
                      Active Font:{' '}
                      <span style={{ color: 'var(--accent-1, #00A884)', fontFamily: fontObj.family, fontWeight: 700 }}>
                        {fontObj.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-1)', marginTop: '2px' }}>
                      Category: {fontObj.category} • Tap to change typography style
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'var(--accent-1, #00A884)',
                      color: '#000',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0, 168, 132, 0.25)',
                    }}
                  >
                    Change a Font 🔤
                  </span>
                </div>
              );
            })()}
          </div>
        </>
      );
    }

    if (currentPage === 'notifications') {
      return (
        <div className="setting-group">
          <h4>Notifications & Sounds</h4>
          {toggleRow('notifications', 'root', 0, 'Private Chats', true)}
          {toggleRow('notifications', 'root', 1, 'Groups', true)}
          {toggleRow('notifications', 'root', 2, 'Channels', false)}
          {toggleRow('notifications', 'root', 3, 'In-App Vibrations', true)}
        </div>
      );
    }

    if (currentPage === 'privacy') {
      const currentPhotoPrivacy = profile.photoPrivacy || 'contacts';
      const allowDownloads = profile.allowPhotoDownloads !== false;
      const autoArchive = advSettings.autoArchiveUnknown || false;
      const groupPerm = advSettings.groupIconEditPermission || 'all';

      return (
        <>
          {/* Profile Photo Visibility */}
          <div className="setting-group">
            <h4>Profile Photo Visibility</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {[
                { id: 'everyone', label: 'Everyone', desc: 'Visible to all users and global search' },
                { id: 'contacts', label: 'My Contacts', desc: 'Visible only to saved contacts' },
                { id: 'except', label: 'My Contacts Except...', desc: 'Excludes specific blocked contacts' },
                { id: 'nobody', label: 'Nobody', desc: 'Hidden from everyone' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onUpdateProfile({ photoPrivacy: opt.id as any });
                    onToast(`Profile photo visibility set to ${opt.label}`);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: currentPhotoPrivacy === opt.id ? 'rgba(0, 168, 132, 0.15)' : 'rgba(255,255,255,0.04)',
                    border: currentPhotoPrivacy === opt.id ? '1px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: currentPhotoPrivacy === opt.id ? 'var(--accent-1, #00A884)' : 'var(--text-0)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>{opt.desc}</div>
                  </div>
                  {currentPhotoPrivacy === opt.id && (
                    <span style={{ color: 'var(--accent-1, #00A884)', fontWeight: 700 }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            <p className="cat-sub" style={{ fontSize: '11.5px', color: 'var(--text-1)', lineHeight: '1.4' }}>
              💡 If set to <b>Nobody</b> or if a user is blocked, contacts will see the default avatar silhouette icon instead of your custom photo.
            </p>

            <div className="toggle-row" style={{ marginTop: '12px' }}>
              <div>
                <span>Allow Profile Photo Downloads</span>
                <div className="cat-sub" style={{ fontSize: '11px' }}>
                  Allow contacts to download high-res copies of your profile photo
                </div>
              </div>
              <div
                className={`toggle ${allowDownloads ? 'on' : ''}`}
                onClick={() => {
                  const next = !allowDownloads;
                  onUpdateProfile({ allowPhotoDownloads: next });
                  onToast(`Profile photo downloads ${next ? 'allowed' : 'disabled'}`);
                }}
              />
            </div>
          </div>

          {/* Chat Archiving & Anti-Spam Privacy */}
          <div className="setting-group">
            <h4>Archiving & Anti-Spam Privacy</h4>
            <div className="toggle-row">
              <div>
                <span>Auto-Archive & Mute Unknown Chats</span>
                <div className="cat-sub" style={{ fontSize: '11px' }}>
                  Automatically move new chats from non-contacts straight to Archived Chats folder
                </div>
              </div>
              <div
                className={`toggle ${autoArchive ? 'on' : ''}`}
                onClick={() => {
                  const next = !autoArchive;
                  onUpdateAdvSettings({ autoArchiveUnknown: next });
                  onToast(`Auto-archive unknown chats ${next ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
          </div>

          {/* Group Icon & Settings Permissions */}
          <div className="setting-group">
            <h4>Group Photo & Info Permissions</h4>
            <div style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '8px' }}>
              Who can edit group photo, title & description:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  onUpdateAdvSettings({ groupIconEditPermission: 'all' });
                  onToast('Group edit permission: All Members');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: groupPerm === 'all' ? '1px solid var(--accent-1)' : '1px solid rgba(255,255,255,0.1)',
                  background: groupPerm === 'all' ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                  color: groupPerm === 'all' ? '#000' : '#fff',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                All Members
              </button>
              <button
                onClick={() => {
                  onUpdateAdvSettings({ groupIconEditPermission: 'admins' });
                  onToast('Group edit permission: Only Admins');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: groupPerm === 'admins' ? '1px solid var(--accent-1)' : '1px solid rgba(255,255,255,0.1)',
                  background: groupPerm === 'admins' ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                  color: groupPerm === 'admins' ? '#000' : '#fff',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Only Admins
              </button>
            </div>
          </div>

          {/* General Security & Passcode */}
          <div className="setting-group">
            <h4>Security & Blocked Users</h4>
            {toggleRow('privacy', 'root', 0, 'Last seen & online status', true)}
            {toggleRow('privacy', 'root', 1, 'Phone number visibility', false)}
            {toggleRow('privacy', 'root', 3, 'Read receipts', true)}

            <div className="info-row" style={{ marginTop: '8px', cursor: 'pointer' }} onClick={() => onToast('Blocked list opened')}>
              <span>Blocked Contacts</span>
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{advSettings.blockedContactsCount || 0} contacts ›</span>
            </div>

            <div className="settings-action-btn" style={{ marginTop: '12px' }} onClick={() => onToast('Passcode screen lock configured')}>
              🔒 Enable Passcode Lock
            </div>
          </div>
        </>
      );
    }

    if (currentPage === 'language') {
      const activeInterfaceLang = advSettings.interfaceLanguage || 'en';
      const activeTargetLang = advSettings.targetLanguage || activeInterfaceLang;

      const filteredLangs = SUPPORTED_LANGUAGES.filter((lang) => {
        if (!langSearchQuery.trim()) return true;
        const q = langSearchQuery.toLowerCase().trim();
        return (
          lang.name.toLowerCase().includes(q) ||
          lang.nativeName.toLowerCase().includes(q) ||
          lang.code.toLowerCase().includes(q)
        );
      });

      return (
        <>
          <div className="setting-group">
            <h4>🌐 {getUIText('interfaceLanguage', activeInterfaceLang)} & {getUIText('translationTarget', activeInterfaceLang)}</h4>
            <div style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '14px', lineHeight: '1.4' }}>
              {getUIText('languageSettingsDesc', activeInterfaceLang)}
            </div>

            {/* Language Search Box */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search language (e.g. Luganda, Swahili, Spanish...)"
                value={langSearchQuery}
                onChange={(e) => setLangSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  paddingRight: langSearchQuery ? '32px' : '14px',
                  borderRadius: '12px',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--accent-1, #00F0FF)',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  outline: 'none',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)',
                }}
              />
              {langSearchQuery && (
                <button
                  onClick={() => setLangSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-1)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Auto Translate Toggle */}
            <div
              className="toggle-row"
              onClick={() => {
                const nextVal = !advSettings.autoTranslateIncoming;
                onUpdateAdvSettings({ autoTranslateIncoming: nextVal });
                onToast(`Auto-translation ${nextVal ? 'enabled' : 'disabled'}`);
              }}
              style={{ cursor: 'pointer', padding: '10px 12px', background: 'var(--bg-1)', borderRadius: '12px', marginBottom: '16px' }}
            >
              <div>
                <span className="li-name" style={{ fontSize: '13.5px', fontWeight: 600 }}>{getUIText('autoTranslate', activeInterfaceLang)}</span>
                <div className="cat-sub" style={{ fontSize: '11.5px', marginTop: '2px' }}>
                  {getUIText('autoTranslateDesc', activeInterfaceLang)}
                </div>
              </div>
              <div className={`sw ${advSettings.autoTranslateIncoming ? 'on' : ''}`}>
                <div className="kn" />
              </div>
            </div>

            {/* Interface Language List */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-1)', display: 'block', marginBottom: '8px' }}>
                App Interface & Default Translation Language ({filteredLangs.length} available)
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredLangs.map((lang) => {
                  const isSelected = activeInterfaceLang === lang.code;
                  return (
                    <div
                      key={lang.code}
                      onClick={() => {
                        onUpdateAdvSettings({
                          interfaceLanguage: lang.code,
                          targetLanguage: lang.code, // Default translate lang is interface lang
                        });
                        onToast(`App & Translation language set to ${lang.name} (${lang.nativeName})`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'var(--bg-1)',
                        border: isSelected ? '1px solid var(--accent-1, #00F0FF)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--accent-1)' : 'var(--text-0)' }}>
                            {lang.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-1)' }}>
                            {lang.nativeName} ({lang.code.toUpperCase()})
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid var(--accent-1, #00F0FF)' : '2px solid var(--border)',
                          background: 'transparent',
                        }}
                      />
                    </div>
                  );
                })}

                {filteredLangs.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-1)', fontSize: '13px' }}>
                    No matching language found for "{langSearchQuery}". Try searching for <b>Luganda</b>, <b>Swahili</b>, <b>Spanish</b>, etc.
                  </div>
                )}
              </div>
            </div>

            {/* Custom Translation Language Override option if user wants different translate target than interface language */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: '6px' }}>
                Separate Message Translation Target Language (Optional Override)
              </label>
              <select
                value={activeTargetLang}
                onChange={(e) => {
                  onUpdateAdvSettings({ targetLanguage: e.target.value });
                  const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                  onToast(`Message translation target set to ${selected ? selected.name : e.target.value}`);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      );
    }

    if (currentPage === 'stickers') {
      const packs = [
        ['Everyday', true, '🎉'],
        ['Work Mood', true, '💼'],
        ['Cats & Co.', false, '🐱'],
        ['Retro Wave', false, '🌆'],
        ['Minimal Line', true, '✨'],
        ['Party Pack', false, '🎊'],
      ] as const;

      return (
        <div className="setting-group">
          <h4>Installed Sticker Packs</h4>
          <div className="theme-grid">
            {packs.map((p, idx) => (
              <div
                key={idx}
                className={`theme-swatch ${p[1] ? 'active' : ''}`}
                onClick={() => onToast(`${p[1] ? 'Removed' : 'Added'} ${p[0]}`)}
              >
                <div className="swatch-preview" style={{ alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  {p[2]}
                </div>
                <p>{p[0]}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentPage === 'devices') {
      const devices = [
        ['Desktop App', 'Connected'],
        ['Web Browser', 'Connected'],
        ['Tablet App', 'Connected'],
      ] as const;

      return (
        <>
          <div className="setting-group">
            <h4>Linked Devices</h4>
            {devices.map((d, idx) => (
              <div key={idx} className="info-row">
                <span>
                  {d[0]}
                  <div className="cat-sub">{d[1]}</div>
                </span>
                <span style={{ color: 'var(--warm)', cursor: 'pointer', fontSize: '11.5px' }} onClick={() => onToast('Device unlinked')}>
                  Unlink
                </span>
              </div>
            ))}
          </div>
          <div className="settings-action-btn" onClick={() => onToast('Scan a QR code to link a new device')}>
            Link New Device
          </div>
        </>
      );
    }

    if (currentPage === 'folders') {
      const folders = [
        ['All Chats', 12],
        ['Personal', 5],
        ['Work', 4],
        ['Groups', 3],
      ] as const;

      return (
        <>
          <div className="setting-group">
            <h4>Your Folders</h4>
            {folders.map((f, idx) => (
              <div key={idx} className="info-row">
                <span>🗂️ {f[0]}</span>
                <span>{f[1]} chats</span>
              </div>
            ))}
          </div>
          <div className="settings-action-btn" onClick={() => onToast('Create Folder dialog')}>
            + Create New Folder
          </div>
        </>
      );
    }

    if (currentPage === 'help') {
      const faqs = [
        ['How do I create a channel?', 'Go to Channels, tap the + button, choose a name and privacy setting.'],
        ['Can I recover a deleted chat?', 'Chats deleted for everyone cannot be recovered.'],
        ['How do Communities work?', 'A community bundles related groups and channels under one roof.'],
        ['Is Two-Step Verification required?', 'No, but it adds a password on top of your login for extra security.'],
      ] as const;

      return (
        <div className="setting-group">
          <h4>NEXA FAQ</h4>
          {faqs.map((f, idx) => (
            <div key={idx} className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ fontWeight: 600 }}>{f[0]}</span>
              <span className="cat-sub">{f[1]}</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const activeLang = advSettings.interfaceLanguage || 'en';

  const getPageTitle = () => {
    if (currentPage === 'home') return getUIText('settings', activeLang);
    if (currentPage === 'profile') return getUIText('editProfile', activeLang);
    if (currentPage === 'appearance') return getUIText('appearance', activeLang);
    if (currentPage === 'data') return getUIText('storage', activeLang);
    if (currentPage === 'language') return getUIText('language', activeLang);
    if (currentPage === 'notifications') return getUIText('notifications', activeLang);
    if (currentPage === 'privacy') return getUIText('privacy', activeLang);
    if (currentPage === 'devices') return getUIText('devices', activeLang);
    if (currentPage === 'help') return getUIText('help', activeLang);
    return getUIText(currentPage, activeLang);
  };

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {settingsStack.length > 1 && (
            <div className="icon-btn" onClick={backSettings}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
          )}
          <h3>{getPageTitle()}</h3>
        </div>
        <div className="icon-btn" onClick={onClose}>
          ✕
        </div>
      </div>
      <div className="drawer-body">{renderSettingsContent()}</div>

      <ProfilePicturePickerModal
        isOpen={isPickerModalOpen}
        currentAvatarUrl={currentAvatar.url}
        userInitials={initials(profile.name)}
        onSave={handleSaveProfilePicture}
        onCancel={() => setIsPickerModalOpen(false)}
        onToast={onToast}
      />
    </div>
  );
};
