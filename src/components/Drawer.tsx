import React, { useState } from 'react';
import { ChatRoom, UserProfile, AdvancedSettingsState, AvatarItem, ThemeOption } from '../types';
import { THEMES, ACCENTS } from '../data';
import { FONT_CATALOG } from '../data/fontsCatalog';
import { SUPPORTED_LANGUAGES, getUIText } from '../services/translator';
import { ProfilePicturePickerModal, ProfilePictureSelection } from './ProfilePicturePickerModal';
import { CachedAvatar } from './CachedAvatar';
import { ALL_FAQS, FAQ_CATEGORIES, getHaithamAIResponse } from '../data/faqsData';
import {
  User,
  Bell,
  Lock,
  HardDrive,
  Palette,
  Globe,
  Smile,
  Laptop,
  Folder,
  Sliders,
  HelpCircle,
  Camera,
  Shield,
  ShieldCheck,
  Fingerprint,
  Smartphone,
  MessageSquare,
  Phone,
  Video,
  Star,
  Pin,
  Flag,
  Ban,
  MoreHorizontal,
  Check,
  ChevronRight,
  ArrowLeft,
  X,
  Archive,
  Search,
  Send,
  Mail,
  Sparkles,
  ChevronDown,
  Copy,
  ExternalLink,
  Code,
  LogOut,
  QrCode,
  Share2,
  Key,
  FileText,
  ShieldAlert,
  Trash2,
  Users,
  AtSign,
  Database,
  RefreshCw,
  FileCode,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  getAccountData,
  saveAccountData,
  validateUsername,
  checkUsernameAvailability,
  BlockedUser,
  PrivacySettings,
  SecuritySettings,
  calculatePasswordStrength,
  getDeviceAccounts,
  addDeviceAccount,
  switchActiveAccount,
  removeDeviceAccount,
  MultiAccount,
} from '../services/AuthService';

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
  onOpenWallpaperPicker?: () => void;
  onOpenFullScreenDp?: (target: { name: string; avatar?: string }) => void;
  onStartDeveloperChat?: () => void;
  onOpenOnboarding?: (stage?: 'splash' | 'intro' | 'get_started' | 'signin' | 'otp' | 'profile_setup') => void;
  onLogout?: () => void;
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
  onOpenWallpaperPicker,
  onOpenFullScreenDp,
  onStartDeveloperChat,
  onOpenOnboarding,
  onLogout,
}) => {
  const [settingsStack, setSettingsStack] = useState<string[]>(['home']);
  const [activeAvatarIdx, setActiveAvatarIdx] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'html' | 'json'>('html');
  const [proxyPing, setProxyPing] = useState<string | null>(null);
  const [langSearchQuery, setLangSearchQuery] = useState<string>('');

  // Account & Privacy Center State
  const [accountData, setAccountData] = useState(() => getAccountData());
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [currentPass, setCurrentPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [showPassText, setShowPassText] = useState<boolean>(false);
  const [passError, setPassError] = useState<string>('');

  // Multi-Account Device State
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [deviceAccounts, setDeviceAccounts] = useState<MultiAccount[]>(() => getDeviceAccounts());
  const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
  const [addAccName, setAddAccName] = useState<string>('');
  const [addAccUsername, setAddAccUsername] = useState<string>('');
  const [addAccPhone, setAddAccPhone] = useState<string>('');
  const [addAccError, setAddAccError] = useState<string>('');
  const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | 'licenses' | 'guidelines' | null>(null);
  const [blockedSearchQuery, setBlockedSearchQuery] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message?: string } | null>(null);

  // Advanced Help Page State (3 Main Options)
  const [helpOption, setHelpOption] = useState<0 | 1 | 2>(0); // 0: FAQ, 1: Haitham AI, 2: Developers
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // Haitham AI Interactive Assistant Chat state
  const [haithamChat, setHaithamChat] = useState<Array<{ id: string; sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      id: 'h1',
      sender: 'ai',
      text: 'Hello! I am Haitham AI Assistant, your dedicated NEXA Messaging guide. I have studied every feature of NEXA from corner to corner. Ask me anything about gestures, multi-select, swipe left to archive, passcode lock, translation, or developer support!',
      time: 'Just now',
    },
  ]);
  const [haithamInput, setHaithamInput] = useState<string>('');
  const [isHaithamTyping, setIsHaithamTyping] = useState<boolean>(false);

  const handleSendHaithamQuery = (queryText?: string) => {
    const q = (queryText || haithamInput).trim();
    if (!q) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHaithamChat((prev) => [...prev, userMsg]);
    setHaithamInput('');
    setIsHaithamTyping(true);

    setTimeout(() => {
      const aiReply = getHaithamAIResponse(q);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai' as const,
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHaithamChat((prev) => [...prev, aiMsg]);
      setIsHaithamTyping(false);
    }, 350);
  };

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

  const actionCell = (icon: React.ReactNode, label: string) => (
    <div key={label} className="action-cell" onClick={() => onToast(label)}>
      <span style={{ fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      {label}
    </div>
  );

  const catRow = (icon: React.ReactNode, label: string, sub: string, onClick: () => void) => (
    <div key={label} className="settings-cat-row" onClick={onClick}>
      <div className="cat-ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div className="cat-body">
        <div className="cat-label">{label}</div>
        {sub ? <div className="cat-sub">{sub}</div> : null}
      </div>
      <ChevronRight size={18} className="chev" style={{ color: 'var(--text-1)' }} />
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
            <CachedAvatar
              src={room.avatar}
              name={room.name}
              size={80}
              onClick={() => onOpenFullScreenDp?.({ name: room.name, avatar: room.avatar })}
            />
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
            {actionCell(<MessageSquare size={18} />, 'Message')}
            {actionCell(<Phone size={18} />, 'Call')}
            {actionCell(<Video size={18} />, 'Video')}
            {actionCell(<Star size={18} />, 'Favorite')}
          </div>

          <div className="action-grid">
            {actionCell(<Pin size={18} />, 'Pin')}
            {actionCell(<Flag size={18} />, 'Report')}
            {actionCell(<Ban size={18} />, 'Block')}
            {actionCell(<MoreHorizontal size={18} />, 'More')}
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
                <img src={currentAvatar.url} alt="Profile Avatar" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials(profile.name)
              )}
            </div>
            <h2 style={{ marginTop: '10px' }}>{profile.name || 'Your Name'}</h2>
            <div className="uname">@{profile.username || 'username'}</div>
          </div>

          <div className="settings-cat-list">
            {catRow(<User size={20} />, 'My Profile', 'Photo/Video avatars, name, handle, bio', () => goSettings('profile'))}
            {catRow(<Sparkles size={20} />, 'App Onboarding & Sign In', 'Re-open splash screen, walkthrough & auth', () => onOpenOnboarding?.('splash'))}
            {catRow(<Bell size={20} />, 'Notifications and Sounds', 'Alerts, vibrations, badges', () => goSettings('notifications'))}
            {catRow(<Lock size={20} />, 'Privacy and Security', 'Last seen, phone & passcode', () => goSettings('privacy'))}
            {catRow(<HardDrive size={20} />, 'Data and Storage', 'Auto-download, cache, directory', () => goSettings('data'))}
            {catRow(<Palette size={20} />, 'Appearance', 'Theme, chat colors, text size', () => goSettings('appearance'))}
            {catRow(<Globe size={20} />, 'Language', 'English', () => goSettings('language'))}
            {catRow(<Smile size={20} />, 'Stickers and Emoji', 'Packs & reactions', () => goSettings('stickers'))}
            {catRow(<Laptop size={20} />, 'Devices', 'Active sessions & linked apps', () => goSettings('devices'))}
            {catRow(<Folder size={20} />, 'Folders', 'Chat organization', () => goSettings('folders'))}
            {catRow(<Sliders size={20} />, 'Advanced', 'Proxy, startup, scaling, export data', () => goSettings('advanced'))}
            {catRow(<HelpCircle size={20} />, 'Help', 'FAQ & support', () => goSettings('help'))}
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
                  <img src={currentAvatar.url} alt="Profile Photo" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  cursor: 'pointer',
                  border: '2px solid var(--bg-1, #111B21)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                }}
              >
                <Camera size={16} />
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
                <Camera size={15} /> Change Profile Photo
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0 }}>Username (@handle)</h4>
              <button
                onClick={() => setShowQrModal(true)}
                style={{
                  background: 'rgba(0, 168, 132, 0.15)',
                  border: '1px solid var(--accent-1, #00A884)',
                  color: 'var(--accent-1, #00A884)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <QrCode size={13} /> Show QR Code
              </button>
            </div>
            <div className="field-row">
              <label>Username</label>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ padding: '0 8px', color: 'var(--accent-1)', fontWeight: 600 }}>@</span>
                <input
                  className="field-input"
                  style={{ flex: 1 }}
                  placeholder="username (e.g. alexvance)"
                  value={profile.username || ''}
                  onChange={(e) => {
                    const u = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    onUpdateProfile({ username: u });
                    if (u.length >= 5) {
                      const res = checkUsernameAvailability(u, profile.username);
                      setUsernameStatus(res);
                    } else {
                      setUsernameStatus(null);
                    }
                  }}
                />
              </div>
            </div>

            {profile.username && profile.username.length < 5 && (
              <div style={{ fontSize: '11.5px', color: '#FF9A6F', marginTop: '4px' }}>
                ⚠️ Username must be at least 5 characters long (a-z, 0-9, _).
              </div>
            )}

            {usernameStatus && (
              <div
                style={{
                  fontSize: '11.5px',
                  color: usernameStatus.available ? '#4ADE80' : '#FF5376',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
              >
                {usernameStatus.available ? <Check size={13} /> : <X size={13} />}
                {usernameStatus.message}
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
              Anyone opening this link can launch a chat with you. Usernames make your profile discoverable in search without revealing your phone number.
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

          {/* Chat Wallpaper Customizer */}
          <div className="setting-group">
            <h4>Chat Wallpaper & Customization</h4>
            <div
              onClick={() => {
                if (onOpenWallpaperPicker) onOpenWallpaperPicker();
                else onToast('Opening Wallpaper Picker...');
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
                  Customize Chat Wallpaper
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-1)', marginTop: '2px' }}>
                  Choose WhatsApp doodles, solids, African motifs, or custom image
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
                Change Wallpaper
              </span>
            </div>
          </div>

          {/* Stories Tray Toggle */}
          <div className="setting-group">
            <h4>Stories & Status Display</h4>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'var(--bg-2, rgba(255,255,255,0.05))',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-0)' }}>
                  Show Stories Tray in Chats List
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-1)', marginTop: '2px' }}>
                  Display recent story update circles above your chat list
                </div>
              </div>
              <input
                type="checkbox"
                checked={advSettings.showStoryTrayInChats !== false}
                onChange={(e) => {
                  onUpdateAdvSettings({ showStoryTrayInChats: e.target.checked });
                  onToast(e.target.checked ? 'Stories tray enabled on chats' : 'Stories tray hidden on chats');
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-1, #00A884)', cursor: 'pointer' }}
              />
            </div>
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
      const blockedCount = accountData.blockedUsers ? accountData.blockedUsers.length : 1;

      return (
        <>
          {/* Privacy & Security Navigation Hub */}
          <div className="setting-group" style={{ background: 'var(--bg-2, rgba(255,255,255,0.03))', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Privacy & Security Hub</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {catRow(<ShieldCheck size={18} style={{ color: 'var(--accent-1)' }} />, 'Account Security & 2FA', 'Password, 2-Step PIN, Sessions & App Lock', () => goSettings('security'))}
              {catRow(<Eye size={18} style={{ color: 'var(--accent-1)' }} />, 'Privacy & Visibility Controls', 'Phone, Last Seen, Photo, Group Invites & Search', () => goSettings('visibility'))}
              {catRow(<Ban size={18} style={{ color: '#FF5376' }} />, 'Blocked Users Management', `${blockedCount} blocked contacts`, () => goSettings('blocked'))}
              {catRow(<HardDrive size={18} style={{ color: 'var(--accent-1)' }} />, 'Data Storage & Cache', 'Cache sizes & auto-download settings', () => goSettings('data'))}
              {catRow(<FileText size={18} style={{ color: 'var(--accent-1)' }} />, 'Legal & Policy Documents', 'Privacy policy, terms & open-source licenses', () => goSettings('legal'))}
            </div>
          </div>

          {/* Profile Photo Visibility Quick Control */}
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

          {/* Group Photo & Info Permissions */}
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

          {/* Device Multi-Account Management (Max 2 Accounts) */}
          <div className="setting-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0 }}>Device Accounts ({deviceAccounts.length}/2)</h4>
              <button
                onClick={() => {
                  if (deviceAccounts.length >= 2) {
                    onToast('⚠️ Device limit reached: Maximum 2 accounts allowed on this device.');
                    return;
                  }
                  setAddAccName('');
                  setAddAccUsername('');
                  setAddAccPhone('');
                  setAddAccError('');
                  setShowAddAccountModal(true);
                }}
                disabled={deviceAccounts.length >= 2}
                style={{
                  background: deviceAccounts.length >= 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0, 168, 132, 0.15)',
                  border: deviceAccounts.length >= 2 ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--accent-1, #00A884)',
                  color: deviceAccounts.length >= 2 ? 'var(--text-1)' : 'var(--accent-1, #00A884)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: deviceAccounts.length >= 2 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: deviceAccounts.length >= 2 ? 0.6 : 1,
                }}
              >
                + Add Account
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {deviceAccounts.map((acc) => (
                <div
                  key={acc.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: acc.isActive ? 'rgba(0, 168, 132, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: acc.isActive ? '1px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--accent-1, #00A884)',
                        color: '#000',
                        fontWeight: 700,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {acc.name}
                        {acc.isActive && (
                          <span style={{ background: 'var(--accent-1)', color: '#000', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '8px' }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>@{acc.username} • {acc.phone}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!acc.isActive && (
                      <button
                        onClick={() => {
                          const updated = switchActiveAccount(acc.id);
                          setDeviceAccounts(updated);
                          onToast(`Switched active account to ${acc.name}`);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(0, 168, 132, 0.2)',
                          border: '1px solid var(--accent-1)',
                          color: 'var(--accent-1)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Switch
                      </button>
                    )}
                    {deviceAccounts.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = removeDeviceAccount(acc.id);
                          setDeviceAccounts(updated);
                          onToast(`Removed account @${acc.username} from device`);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="cat-sub" style={{ fontSize: '11px', marginTop: '8px', color: 'var(--text-1)' }}>
              🔒 Device Limit Policy: Maximum of 2 signed-in accounts allowed simultaneously on one device.
            </p>

            <div
              className="settings-action-btn"
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => {
                if (onLogout) {
                  onLogout();
                  onClose();
                }
              }}
            >
              <LogOut size={16} /> Log Out of Nexa Account
            </div>
          </div>
        </>
      );
    }

    if (currentPage === 'security') {
      const is2FA = accountData.is2FAEnabled;
      const appLock = accountData.securitySettings?.appLockEnabled || false;
      const biometrics = accountData.securitySettings?.biometricsEnabled !== false;

      return (
        <>
          {/* Master Password */}
          <div className="setting-group">
            <h4>Master Account Password</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>Master Password</div>
                <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>Protected with salted hashing</div>
              </div>
              <button
                onClick={() => {
                  setPassError('');
                  setCurrentPass('');
                  setNewPass('');
                  setConfirmPass('');
                  setShowPasswordModal(true);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 168, 132, 0.15)',
                  border: '1px solid var(--accent-1, #00A884)',
                  color: 'var(--accent-1, #00A884)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Key size={14} /> Change Password
              </button>
            </div>
          </div>

          {/* Two-Step Verification (2FA) */}
          <div className="setting-group">
            <h4>Two-Step Verification (2FA)</h4>
            <div className="toggle-row">
              <div>
                <span>Enable Two-Step Verification</span>
                <div className="cat-sub" style={{ fontSize: '11px' }}>
                  Requires a custom 2-step PIN when logging in on a new device
                </div>
              </div>
              <div
                className={`toggle ${is2FA ? 'on' : ''}`}
                onClick={() => {
                  const updated = !is2FA;
                  const newAcc = { ...accountData, is2FAEnabled: updated };
                  setAccountData(newAcc);
                  saveAccountData(newAcc);
                  onToast(updated ? 'Two-Step Verification enabled' : 'Two-Step Verification disabled');
                }}
              />
            </div>

            <div className="field-row" style={{ marginTop: '12px' }}>
              <label>Recovery Email Address</label>
              <input
                className="field-input"
                placeholder="Recovery email address"
                value={accountData.recoveryEmail || ''}
                onChange={(e) => {
                  const email = e.target.value;
                  const newAcc = { ...accountData, recoveryEmail: email };
                  setAccountData(newAcc);
                  saveAccountData(newAcc);
                }}
              />
            </div>
          </div>

          {/* Active Sessions & Logged-in Devices */}
          <div className="setting-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0 }}>Active Logged-In Sessions</h4>
              <button
                onClick={() => {
                  const currentOnly = accountData.trustedDevices.filter(d => d.isCurrent);
                  const newAcc = { ...accountData, trustedDevices: currentOnly };
                  setAccountData(newAcc);
                  saveAccountData(newAcc);
                  onToast('Terminated all other sessions successfully!');
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FF5376',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Terminate Other Sessions
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {accountData.trustedDevices.map((dev) => (
                <div
                  key={dev.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: dev.isCurrent ? 'rgba(0, 168, 132, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: dev.isCurrent ? '1px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={20} style={{ color: dev.isCurrent ? 'var(--accent-1)' : 'var(--text-1)' }} />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-0)' }}>
                        {dev.deviceName} {dev.isCurrent && <span style={{ color: 'var(--accent-1)', fontSize: '11px', marginLeft: '6px' }}>(This Device)</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>
                        {dev.browser} • {dev.location}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: dev.isCurrent ? '#4ADE80' : 'var(--text-1)', fontWeight: 500 }}>
                    {dev.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Lock & Biometrics */}
          <div className="setting-group">
            <h4>App Passcode & Biometric Security</h4>
            <div className="toggle-row">
              <div>
                <span>Biometric Authentication</span>
                <div className="cat-sub" style={{ fontSize: '11px' }}>
                  Use Face ID or Touch ID to unlock Nexa
                </div>
              </div>
              <div
                className={`toggle ${biometrics ? 'on' : ''}`}
                onClick={() => {
                  const updated = !biometrics;
                  const newAcc = {
                    ...accountData,
                    securitySettings: { ...accountData.securitySettings, biometricsEnabled: updated },
                  };
                  setAccountData(newAcc);
                  saveAccountData(newAcc);
                  onToast(updated ? 'Biometric unlock enabled' : 'Biometric unlock disabled');
                }}
              />
            </div>
          </div>
        </>
      );
    }

    if (currentPage === 'visibility') {
      const p = accountData.privacySettings || {};

      const updatePrivacyField = (key: keyof PrivacySettings, val: any) => {
        const newPrivacy = { ...accountData.privacySettings, [key]: val };
        const newAcc = { ...accountData, privacySettings: newPrivacy };
        setAccountData(newAcc);
        saveAccountData(newAcc);
        onToast(`Updated ${key} visibility preference`);
      };

      const renderVisibilityRow = (title: string, desc: string, field: keyof PrivacySettings) => {
        const currentVal = p[field] || 'everyone';
        return (
          <div key={field} style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>{title}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-1)', marginBottom: '8px' }}>{desc}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'everyone', label: 'Everyone' },
                { id: 'contacts', label: 'My Contacts' },
                { id: 'nobody', label: 'Nobody' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updatePrivacyField(field, opt.id)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: currentVal === opt.id ? '1px solid var(--accent-1)' : '1px solid rgba(255,255,255,0.1)',
                    background: currentVal === opt.id ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                    color: currentVal === opt.id ? '#000' : '#fff',
                    fontWeight: 600,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      };

      return (
        <div className="setting-group">
          <h4>Privacy & Discovery Preferences</h4>
          {renderVisibilityRow('Phone Number', 'Who can see your phone number on your profile', 'phoneNumber')}
          {renderVisibilityRow('Last Seen & Online', 'Who can see when you were last online', 'lastSeen')}
          {renderVisibilityRow('Profile Photo', 'Who can view your full resolution profile picture', 'profilePhoto')}
          {renderVisibilityRow('Bio & Profile Details', 'Who can read your bio and personal handles', 'bio')}
          {renderVisibilityRow('Email Address', 'Who can see your linked account email address', 'emailAddress')}
          {renderVisibilityRow('Group Invites', 'Who can add you to group chats directly', 'groupInvites')}
          {renderVisibilityRow('Channel Invites', 'Who can add you to broadcast channels', 'channelInvites')}
          {renderVisibilityRow('Who Can Find Me by Phone', 'Who can search for your account using your phone number', 'findMeByPhone')}
          {renderVisibilityRow('Who Can Find Me by Username', 'Who can locate your profile via global @username search', 'findMeByUsername')}
        </div>
      );
    }

    if (currentPage === 'blocked') {
      const blockedList = accountData.blockedUsers || [];
      const filteredBlocked = blockedList.filter((u) =>
        u.name.toLowerCase().includes(blockedSearchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(blockedSearchQuery.toLowerCase()) ||
        u.phone.includes(blockedSearchQuery)
      );

      const handleUnblockUser = (id: string, name: string) => {
        const updated = blockedList.filter((u) => u.id !== id);
        const newAcc = { ...accountData, blockedUsers: updated };
        setAccountData(newAcc);
        saveAccountData(newAcc);
        onToast(`Unblocked ${name}`);
      };

      return (
        <div className="setting-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Blocked Contacts ({blockedList.length})</h4>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              className="field-input"
              placeholder="Search blocked contacts..."
              value={blockedSearchQuery}
              onChange={(e) => setBlockedSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          </div>

          {filteredBlocked.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-1)', fontSize: '12.5px' }}>
              {blockedList.length === 0 ? 'No blocked contacts.' : 'No matching blocked contacts.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredBlocked.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user.avatar ? (
                      <img src={user.avatar} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-1)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-1)' }}>@{user.username} • {user.phone}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblockUser(user.id, user.name)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0, 168, 132, 0.15)',
                      border: '1px solid var(--accent-1, #00A884)',
                      color: 'var(--accent-1, #00A884)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (currentPage === 'legal') {
      return (
        <div className="setting-group">
          <h4>Legal, Terms & Compliance</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {catRow(<FileText size={18} style={{ color: 'var(--accent-1)' }} />, 'Privacy Policy', 'Data collection, encryption & usage rights', () => setShowLegalModal('privacy'))}
            {catRow(<FileCode size={18} style={{ color: 'var(--accent-1)' }} />, 'Terms of Service', 'User agreement & service terms', () => setShowLegalModal('terms'))}
            {catRow(<Code size={18} style={{ color: 'var(--accent-1)' }} />, 'Open Source Licenses', 'Third-party components & dependencies', () => setShowLegalModal('licenses'))}
            {catRow(<Users size={18} style={{ color: 'var(--accent-1)' }} />, 'Community Guidelines', 'Safety standards & conduct code', () => setShowLegalModal('guidelines'))}
          </div>
        </div>
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
            <h4>{getUIText('interfaceLanguage', activeInterfaceLang)} & {getUIText('translationTarget', activeInterfaceLang)}</h4>
            <div style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '14px', lineHeight: '1.4' }}>
              {getUIText('languageSettingsDesc', activeInterfaceLang)}
            </div>

            {/* Language Search Box */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search language (e.g. Luganda, Swahili, Spanish...)"
                value={langSearchQuery}
                onChange={(e) => setLangSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  paddingRight: langSearchQuery ? '32px' : '14px',
                  borderRadius: '8px',
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  outline: 'none',
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
                  }}
                >
                  <X size={14} />
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
              style={{ cursor: 'pointer', padding: '10px 12px', background: 'var(--bg-1)', borderRadius: '8px', marginBottom: '16px' }}
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
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-1)', display: 'block', marginBottom: '8px' }}>
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
                          targetLanguage: lang.code,
                        });
                        onToast(`App & Translation language set to ${lang.name} (${lang.nativeName})`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(0, 168, 132, 0.12)' : 'var(--bg-1)',
                        border: isSelected ? '1px solid var(--accent-1, #00A884)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--accent-1)' : 'var(--text-0)' }}>
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
                          border: isSelected ? '5px solid var(--accent-1, #00A884)' : '2px solid var(--border)',
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

            {/* Custom Translation Language Override */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
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
                  borderRadius: '8px',
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
                    {lang.name} ({lang.nativeName})
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
        ['Everyday Essentials', true],
        ['Work & Productivity', true],
        ['Cats & Companions', false],
        ['Retro Wave Vectors', false],
        ['Minimalist Monoline', true],
        ['Celebration Pack', false],
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
                <div className="swatch-preview" style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Smile size={24} style={{ color: 'var(--accent-1)' }} />
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
        ['Desktop Application', 'Connected · Active now'],
        ['Web Client (Chrome)', 'Connected · 2 hours ago'],
        ['Tablet Companion App', 'Connected · Yesterday'],
      ] as const;

      return (
        <>
          <div className="setting-group">
            <h4>Linked Devices & Sessions</h4>
            {devices.map((d, idx) => (
              <div key={idx} className="info-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Laptop size={18} style={{ color: 'var(--accent-1)' }} />
                  <span>
                    {d[0]}
                    <div className="cat-sub">{d[1]}</div>
                  </span>
                </div>
                <span style={{ color: 'var(--warm)', cursor: 'pointer', fontSize: '11.5px', fontWeight: 500 }} onClick={() => onToast('Device session unlinked')}>
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
            <h4>Your Chat Folders</h4>
            {folders.map((f, idx) => (
              <div key={idx} className="info-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={16} style={{ color: 'var(--accent-1)' }} />
                  {f[0]}
                </span>
                <span style={{ color: 'var(--text-1)', fontSize: '12px' }}>{f[1]} chats</span>
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
      const filteredFaqs = ALL_FAQS.filter((item) => {
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
        if (!matchesCat) return false;
        if (!faqSearch.trim()) return true;
        const query = faqSearch.toLowerCase().trim();
        return (
          item.question.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.steps.some((s) => s.toLowerCase().includes(query))
        );
      });

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header 3-Option Navigation Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '4px',
              padding: '4px',
              borderRadius: '8px',
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => setHelpOption(0)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 4px',
                borderRadius: '6px',
                border: 'none',
                background: helpOption === 0 ? 'var(--accent-1, #00A884)' : 'transparent',
                color: helpOption === 0 ? '#000' : 'var(--text-0)',
                fontWeight: helpOption === 0 ? 600 : 400,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <HelpCircle size={14} />
              <span>1. FAQ</span>
            </button>

            <button
              onClick={() => setHelpOption(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 4px',
                borderRadius: '6px',
                border: 'none',
                background: helpOption === 1 ? 'var(--accent-1, #00A884)' : 'transparent',
                color: helpOption === 1 ? '#000' : 'var(--text-0)',
                fontWeight: helpOption === 1 ? 600 : 400,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={14} />
              <span>2. HAITHAM AI</span>
            </button>

            <button
              onClick={() => setHelpOption(2)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 4px',
                borderRadius: '6px',
                border: 'none',
                background: helpOption === 2 ? 'var(--accent-1, #00A884)' : 'transparent',
                color: helpOption === 2 ? '#000' : 'var(--text-0)',
                fontWeight: helpOption === 2 ? 600 : 400,
                fontSize: '11.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Code size={14} />
              <span>3. DEVELOPERS</span>
            </button>
          </div>

          {/* Option 1: FAQ Section */}
          {helpOption === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--text-0)' }}>
                  Knowledge Base ({ALL_FAQS.length} Step-by-Step Guides)
                </h4>
              </div>

              {/* Search FAQ */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-1)' }}
                />
                <input
                  type="text"
                  placeholder="Search 100 FAQs (e.g. archive, passcode, language)..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-0)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                {faqSearch && (
                  <button
                    onClick={() => setFaqSearch('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-1)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: selectedCategory === cat ? 600 : 400,
                      background: selectedCategory === cat ? 'rgba(0, 168, 132, 0.15)' : 'var(--bg-1)',
                      color: selectedCategory === cat ? 'var(--accent-1, #00A884)' : 'var(--text-1)',
                      border: selectedCategory === cat ? '1px solid var(--accent-1, #00A884)' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      style={{
                        borderRadius: '8px',
                        background: 'var(--bg-1)',
                        border: isExpanded ? '1px solid var(--accent-1, #00A884)' : '1px solid var(--border)',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        style={{
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '10.5px', color: 'var(--accent-1)', fontWeight: 600, marginBottom: '2px' }}>
                            #{faq.id} · {faq.category}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-0)', lineHeight: '1.35' }}>
                            {faq.question}
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={18} style={{ color: 'var(--accent-1)', flexShrink: 0 }} /> : <ChevronRight size={18} style={{ color: 'var(--text-1)', flexShrink: 0 }} />}
                      </div>

                      {isExpanded && (
                        <div
                          style={{
                            padding: '12px 14px',
                            borderTop: '1px solid var(--border)',
                            background: 'rgba(0,0,0,0.15)',
                            fontSize: '12.5px',
                            color: 'var(--text-0)',
                            lineHeight: '1.45',
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent-1)' }}>
                            Step-by-Step Solution:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {faq.steps.map((step, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <span
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '4px',
                                    background: 'var(--accent-1)',
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '10.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '1px',
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredFaqs.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-1)', fontSize: '13px' }}>
                    No matching FAQ found for "{faqSearch}". Try searching for terms like <b>archive</b>, <b>passcode</b>, <b>language</b>, or <b>calls</b>.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Option 2: ASK HAITHAM AI ASSISTANT */}
          {helpOption === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '520px' }}>
              {/* AI Status Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(0, 168, 132, 0.12)',
                  border: '1px solid var(--accent-1, #00A884)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--accent-1, #00A884)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>Haitham AI Assistant</div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-1)' }}>Studied NEXA App end-to-end · Instant Answers</div>
                </div>
              </div>

              {/* Quick Preset Prompts */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {[
                  'How to swipe to archive?',
                  'How to enable Passcode lock?',
                  'How to change app language?',
                  'Contact developers email',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => handleSendHaithamQuery(promptText)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-0)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  overflowY: 'auto',
                  padding: '10px',
                  background: 'var(--bg-0)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                {haithamChat.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: msg.sender === 'user' ? 'var(--bubble-out, #005c4b)' : 'var(--bg-1)',
                      color: 'var(--text-0)',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-1)',
                        textAlign: 'right',
                        marginTop: '4px',
                        opacity: 0.7,
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                ))}

                {isHaithamTyping && (
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-1)',
                      color: 'var(--text-1)',
                      fontSize: '12px',
                      fontStyle: 'italic',
                    }}
                  >
                    Haitham AI is formulating guide...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ask Haitham AI any question about NEXA..."
                  value={haithamInput}
                  onChange={(e) => setHaithamInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendHaithamQuery()}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-0)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => handleSendHaithamQuery()}
                  style={{
                    padding: '0 14px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--accent-1, #00A884)',
                    color: '#000',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Option 3: CONTACT: THE GREAT MINDS (DEVELOPERS) */}
          {helpOption === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Code size={18} style={{ color: 'var(--accent-1)' }} />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-0)' }}>
                    Contact: The Great Minds (Developers)
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-1)', lineHeight: '1.45', margin: 0 }}>
                  Need direct assistance, custom integrations, or bug reporting? Pick how you want to communicate with our engineering team:
                </p>
              </div>

              {/* Pick Communication Method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Method 1: Direct Email */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Mail size={18} style={{ color: 'var(--accent-1)' }} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>Option 1: Direct Email</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-1)', fontWeight: 500 }}>hpro453176@gmail.com</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('hpro453176@gmail.com');
                        onToast('Email copied: hpro453176@gmail.com');
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-0)',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>

                  <a
                    href="mailto:hpro453176@gmail.com?subject=NEXA%20Support%20Inquiry"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '9px',
                      borderRadius: '6px',
                      background: 'var(--accent-1, #00A884)',
                      color: '#000',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      textDecoration: 'none',
                      textAlign: 'center',
                    }}
                  >
                    <ExternalLink size={14} /> Send Email via App (hpro453176@gmail.com)
                  </a>
                </div>

                {/* Method 2: Through NEXA App Chat */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageSquare size={18} style={{ color: 'var(--accent-1)' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)' }}>Option 2: Through NEXA App Chat</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-1)' }}>
                        Instant direct chat with The Great Minds engineering team inside NEXA
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartDeveloperChat) {
                        onStartDeveloperChat();
                      } else {
                        onToast('Opening chat with The Great Minds (Developers)...');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '9px',
                      borderRadius: '6px',
                      background: 'rgba(0, 168, 132, 0.15)',
                      border: '1px solid var(--accent-1, #00A884)',
                      color: 'var(--accent-1, #00A884)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    <MessageSquare size={15} /> Open NEXA App Chat with Developers
                  </button>
                </div>
              </div>
            </div>
          )}
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
    if (currentPage === 'security') return 'Account Security & 2FA';
    if (currentPage === 'visibility') return 'Privacy & Visibility';
    if (currentPage === 'blocked') return 'Blocked Users';
    if (currentPage === 'legal') return 'Legal & Compliance';
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

      {/* QR Code Share Modal */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#111b21', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '360px', padding: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>My Nexa QR Code</h3>
              <div style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setShowQrModal(false)}>✕</div>
            </div>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <svg width="180" height="180" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                <path d="M10 10h30v30h-30zM15 15v20h20v-20zM22 22h6v6h-6z" fill="#000000" />
                <path d="M60 10h30v30h-30zM65 15v20h20v-20zM72 22h6v6h-6z" fill="#000000" />
                <path d="M10 60h30v30h-30zM15 65v20h20v-20zM22 72h6v6h-6z" fill="#000000" />
                <path d="M45 10h10v10h-10zM50 25h10v10h-10zM10 45h10v10h-10zM25 45h10v10h-10zM45 45h10v10h-10zM60 45h30v10h-30zM45 60h10v30h-10zM60 60h10v10h-10zM75 60h15v15h-15zM60 80h20v10h-20z" fill="#000000" />
              </svg>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{profile.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--accent-1, #00A884)', fontWeight: 600, marginBottom: '16px' }}>
              @{profile.username || 'username'}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://nexa.me/${profile.username || ''}`);
                  onToast('Profile direct link copied!');
                }}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--accent-1, #00A884)', color: '#000', border: 'none', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  onToast('QR Code saved to gallery');
                }}
                style={{ padding: '9px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#111b21', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '380px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Change Master Password</h3>
              <div style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setShowPasswordModal(false)}>✕</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-1)', display: 'block', marginBottom: '4px' }}>Current Password</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Enter current password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-1)', display: 'block', marginBottom: '4px' }}>New Password</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Enter new password (min 8 characters)"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-1)', display: 'block', marginBottom: '4px' }}>Confirm New Password</label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Re-enter new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>

              {passError && (
                <div style={{ fontSize: '12px', color: '#FF5376', fontWeight: 600 }}>
                  ⚠️ {passError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!currentPass) {
                      setPassError('Please enter your current password.');
                      return;
                    }
                    if (newPass.length < 8) {
                      setPassError('New password must be at least 8 characters long.');
                      return;
                    }
                    if (newPass !== confirmPass) {
                      setPassError('New password and confirmation do not match.');
                      return;
                    }
                    setShowPasswordModal(false);
                    onToast('Master Password updated successfully!');
                  }}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--accent-1, #00A884)', color: '#000', border: 'none', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Save Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal & Policy Viewer Modal */}
      {showLegalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#111b21', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '440px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', textTransform: 'capitalize' }}>
                Nexa {showLegalModal.replace('_', ' ')}
              </h3>
              <div style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setShowLegalModal(null)}>✕</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', fontSize: '12.5px', lineHeight: '1.6', color: 'var(--text-1)', paddingRight: '6px' }}>
              {showLegalModal === 'privacy' && (
                <div>
                  <h4 style={{ color: '#fff', marginTop: 0 }}>Privacy & Data Encryption Policy</h4>
                  <p>Nexa is built from the ground up to protect user privacy. All personal messages, voice calls, and file transfers are protected using end-to-end transport layer security and salted password hashing.</p>
                  <p>We do not track or sell user communication metadata. Your phone number and profile handles are strictly subject to your chosen discovery settings.</p>
                </div>
              )}

              {showLegalModal === 'terms' && (
                <div>
                  <h4 style={{ color: '#fff', marginTop: 0 }}>Terms of Service</h4>
                  <p>By using the Nexa Communication Platform, you agree to comply with our community standards and service terms.</p>
                  <p>Users must not engage in automated spamming, harassment, or unlawful activity on the platform. Violation of terms may result in account termination.</p>
                </div>
              )}

              {showLegalModal === 'licenses' && (
                <div>
                  <h4 style={{ color: '#fff', marginTop: 0 }}>Open Source Licenses</h4>
                  <p>Nexa includes open-source libraries under the MIT and Apache 2.0 licenses, including Lucide Icons, React, and Vite utilities.</p>
                  <p>Full software license notices and source credits are available in our public developer documentation.</p>
                </div>
              )}

              {showLegalModal === 'guidelines' && (
                <div>
                  <h4 style={{ color: '#fff', marginTop: 0 }}>Community Guidelines</h4>
                  <p>We maintain a safe, inclusive, and professional environment for messaging and collaboration.</p>
                  <p>Respect other users' privacy, do not impersonate official support handles (@nexa, @admin), and keep public group conversations constructive.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLegalModal(null)}
              style={{ marginTop: '16px', padding: '9px', borderRadius: '8px', background: 'var(--accent-1, #00A884)', color: '#000', border: 'none', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer', width: '100%' }}
            >
              Close Document
            </button>
          </div>
        </div>
      )}

      {/* Add Account Modal (Device Limit: 2 Accounts Max) */}
      {showAddAccountModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#111b21', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '380px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Add Secondary Nexa Account</h3>
              <div style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setShowAddAccountModal(false)}>✕</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-1)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Sarah Connor"
                  value={addAccName}
                  onChange={(e) => setAddAccName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-1)', display: 'block', marginBottom: '4px' }}>Username (@handle)</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. sarah_c"
                  value={addAccUsername}
                  onChange={(e) => setAddAccUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--text-1)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. +1 555 01928"
                  value={addAccPhone}
                  onChange={(e) => setAddAccPhone(e.target.value)}
                />
              </div>

              {addAccError && (
                <div style={{ fontSize: '12px', color: '#FF5376', fontWeight: 600 }}>
                  ⚠️ {addAccError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!addAccName.trim()) {
                      setAddAccError('Please enter a display name.');
                      return;
                    }
                    if (addAccUsername.length < 4) {
                      setAddAccError('Username must be at least 4 characters long.');
                      return;
                    }
                    if (!addAccPhone.trim()) {
                      setAddAccError('Please enter a phone number.');
                      return;
                    }

                    const res = addDeviceAccount({
                      name: addAccName.trim(),
                      username: addAccUsername.trim(),
                      phone: addAccPhone.trim(),
                    });

                    if (!res.success) {
                      setAddAccError(res.message);
                    } else {
                      setDeviceAccounts(res.accounts);
                      setShowAddAccountModal(false);
                      onToast(res.message);
                    }
                  }}
                  style={{ flex: 1, padding: '9px', borderRadius: '8px', background: 'var(--accent-1, #00A884)', color: '#000', border: 'none', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
