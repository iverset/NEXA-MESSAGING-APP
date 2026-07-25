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
  subject: string;
  snippet: string;
  time: string;
  unread: boolean;
}

export interface Story {
  id: number;
  name: string;
  avatar: string;
  seen: boolean;
  mine?: boolean;
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
}

export interface AdvancedSettingsState {
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
