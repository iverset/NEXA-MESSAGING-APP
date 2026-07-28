export interface AnimatedStickerItem {
  id: string;
  name: string;
  category: string;
  previewEmoji: string;
  lottieUrl?: string;
  lottieData?: any;
  animatedSvg?: string;
}

export type AppSection = 'chats' | 'groups' | 'channels' | 'communities' | 'mail' | 'stories';

export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatRoom {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  unread?: number;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  archivedPinned?: boolean;
  isUnknownSender?: boolean;
  last: string;
  time?: string;
  members?: number;
  type?: string;
  subs?: string;
  groups?: number;
  channels?: number;
  desc?: string;
}

export interface ChatMessage {
  from: 'me' | 'them';
  type: 'text' | 'sticker' | 'doc' | 'voice' | 'location' | 'contact' | 'poll' | 'sketch';
  text?: string;
  time: string;
  status?: MessageStatus;
  emoji?: string;
  name?: string;
  size?: string;
  dur?: string;
  label?: string;
  cname?: string;
  cphone?: string;
  question?: string;
  options?: [string, number][];
  avatar?: string;
  reactions?: string[];
  replyText?: string;
  stickerData?: {
    name: string;
    animatedSvg?: string;
    lottieUrl?: string;
    lottieData?: any;
  };
  translatedText?: string;
  translatedLang?: string;
  detectedSourceLang?: string;
  isTranslating?: boolean;
  showOriginal?: boolean;
  translationEngine?: string;
}

export interface MailItem {
  id: string;
  from: string;
  avatar?: string;
  subject: string;
  snippet: string;
  time: string;
  unread: boolean;
}

export interface StatusMusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioPreviewUrl?: string;
  startTime?: number; // start second (0 to 45s)
  duration?: number; // e.g. 15s
  layoutStyle?: 'vinyl' | 'cassette' | 'card' | 'lyrics';
}

export interface StatusSticker {
  id: string;
  type: 'location' | 'timestamp' | 'emoji';
  content: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface StatusViewerRecord {
  id: string;
  name: string;
  avatar?: string;
  time: string;
}

export interface StatusItem {
  id: string;
  type: 'image' | 'video' | 'text';
  mediaUrl?: string;
  caption?: string;
  textOverlay?: string;
  textColor?: string;
  bgColor?: string;
  fontStyle?: 'sans' | 'serif' | 'handwritten' | 'bold' | 'monospace';
  filter?: 'none' | 'pop' | 'bw' | 'cool' | 'warm';
  isMuted?: boolean;
  doodles?: { points: { x: number; y: number }[]; color: string }[];
  stickers?: StatusSticker[];
  music?: StatusMusicTrack;
  privacy?: 'contacts' | 'contacts_except' | 'only_share';
  createdAt: string;
  viewers?: StatusViewerRecord[];
}

export interface Story {
  id: string | number;
  userId?: string;
  name: string;
  avatar: string;
  seen: boolean;
  mine?: boolean;
  timeAgo?: string;
  items?: StatusItem[];
}

export interface AvatarItem {
  id: string;
  url: string;
  isVideo?: boolean;
  videoUrl?: string;
  isPublicPhoto?: boolean;
  createdAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  bio: string;
  phone: string;
  avatars: AvatarItem[];
  activeAvatarId: string;
  publicAvatarId?: string;
  photoPrivacy?: 'everyone' | 'contacts' | 'contacts_except' | 'nobody';
  allowPhotoDownloads?: boolean;
}

export interface AdvancedSettingsState {
  // Archive & Privacy Settings
  autoArchiveUnknown: boolean;
  groupIconEditPermission: 'all' | 'admins';
  blockedContactsCount: number;
  // Data & Automatic Media Downloads
  autoDownloadPrivate: boolean;
  autoDownloadGroups: boolean;
  autoDownloadChannels: boolean;
  maxPhotoSizeMB: number;
  maxVideoSizeMB: number;
  maxFileSizeMB: number;
  // Autoplay & Streaming
  autoplayGIFs: boolean;
  autoplayVideos: boolean;
  streamMedia: boolean;
  // Storage & Download Directory
  downloadPath: string;
  askWhereToSave: boolean;
  // Network & Proxy
  proxyType: 'none' | 'socks5' | 'mtproto';
  proxyServer: string;
  proxyPort: string;
  proxyUsername?: string;
  proxyPassword?: string;
  useIPv6: boolean;
  proxyEnabled: boolean;
  // System Integration
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  taskbarFlash: boolean;
  // Performance & Graphics
  interfaceScale: number; // 100 to 150
  hardwareAccel: boolean;
  reduceAnimations: boolean;
  // Font & Typography Customization
  selectedFontId?: string;
  fontFamily?: string;
  // Translation & Language Settings
  interfaceLanguage: string;
  targetLanguage: string;
  autoTranslateIncoming: boolean;
}

export interface WhatsAppTheme {
  id: string;
  name: string;
  isDark: boolean;
  primary: string;
  primaryDark: string;
  accent: string;
  background: string;
  surface: string;
  chatBubbleSent: string;
  chatBubbleReceived: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
}

export interface ThemeOption {
  k: string;
  label: string;
  c: [string, string, string];
}
