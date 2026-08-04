import React, { useState, useEffect } from 'react';
import { AppSection, ChatRoom, ChatMessage, MailFolder, MailItem, Story, StatusItem, UserProfile, AdvancedSettingsState, ThemeOption } from './types';
import {
  INITIAL_CHATS,
  INITIAL_GROUPS,
  INITIAL_CHANNELS,
  INITIAL_COMMUNITIES,
  INITIAL_MAIL,
  INITIAL_STORIES,
  INITIAL_MESSAGES,
  AUTO_REPLIES,
  ACCENTS,
} from './data';
import { RailNav } from './components/RailNav';
import { ListPanel } from './components/ListPanel';
import { ChatPanel } from './components/ChatPanel';
import { Drawer } from './components/Drawer';
import { Toast, ToastState } from './components/Toast';
import { FontSelectorModal } from './components/FontSelectorModal';
import { StatusEditorModal } from './components/StatusEditorModal';
import { StatusViewerModal } from './components/StatusViewerModal';
import { ProfilePreviewModal, ProfilePreviewTarget } from './components/ProfilePreviewModal';
import { WallpaperPickerModal } from './components/WallpaperPickerModal';
import { OnboardingAuthScreen } from './components/OnboardingAuthScreen';
import { FONT_CATALOG, loadGoogleFont } from './data/fontsCatalog';
import { translateText } from './services/translator';
import { askGreatMindsAI } from './services/GreatMindsAIService';
import { GreatMindsVoiceModal } from './components/GreatMindsVoiceModal';

export default function App() {
  const [section, setSection] = useState<AppSection>('chats');
  const [activeId, setActiveId] = useState<string | null>('c1');
  const [activeMailFolder, setActiveMailFolder] = useState<MailFolder>('inbox');

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<'profile' | 'contact' | 'settings'>('settings');

  const [chats, setChats] = useState<ChatRoom[]>(INITIAL_CHATS);
  const [groups, setGroups] = useState<ChatRoom[]>(INITIAL_GROUPS);
  const [channels, setChannels] = useState<ChatRoom[]>(INITIAL_CHANNELS);
  const [communities, setCommunities] = useState<ChatRoom[]>(INITIAL_COMMUNITIES);
  const [mail, setMail] = useState<Record<MailFolder, MailItem[]>>(INITIAL_MAIL);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Alex',
    lastName: 'Vance',
    name: 'Alex Vance',
    username: 'alexvance',
    bio: 'Building things that connect people in Kampala & beyond. Check @nexa_official!',
    phone: '+256 700 123456',
    avatars: [
      {
        id: 'av1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        isVideo: false,
        createdAt: 'Today',
      },
    ],
    activeAvatarId: 'av1',
    publicAvatarId: 'av1',
  });

  const [advSettings, setAdvSettings] = useState<AdvancedSettingsState>({
    autoDownloadPrivate: true,
    autoDownloadGroups: true,
    autoDownloadChannels: false,
    maxPhotoSizeMB: 10,
    maxVideoSizeMB: 50,
    maxFileSizeMB: 100,
    autoplayGIFs: true,
    autoplayVideos: true,
    streamMedia: true,
    downloadPath: '/Users/nexa/Downloads/NEXA',
    askWhereToSave: false,
    proxyType: 'none',
    proxyServer: '127.0.0.1',
    proxyPort: '1080',
    proxyUsername: '',
    proxyPassword: '',
    useIPv6: true,
    proxyEnabled: false,
    launchOnStartup: true,
    minimizeToTray: true,
    taskbarFlash: true,
    interfaceScale: 100,
    hardwareAccel: true,
    reduceAnimations: false,
    interfaceLanguage: 'en',
    targetLanguage: 'en',
    autoTranslateIncoming: false,
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeOption['k']>('night');
  const [bubbleRadius, setBubbleRadius] = useState<number>(16);
  const [fontScale, setFontScale] = useState<number>(1);
  const [isFontModalOpen, setIsFontModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('nexa_is_authenticated') === 'true');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => localStorage.getItem('nexa_is_authenticated') !== 'true');
  const [onboardingStage, setOnboardingStage] = useState<'splash' | 'intro' | 'get_started' | 'signin' | 'otp' | 'profile_setup'>('splash');
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [selectedRadioStates, setSelectedRadioStates] = useState<Record<string, number>>({});

  const [toastState, setToastState] = useState<ToastState | string | null>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bubble-radius', `${bubbleRadius}px`);
  }, [bubbleRadius]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontScale}`);
  }, [fontScale]);

  const userActiveAvatarUrl =
    (profile.avatars.find((a) => a.id === profile.activeAvatarId) || profile.avatars[0])?.url;

  // Sync user active avatar to 'Your Story'
  useEffect(() => {
    if (userActiveAvatarUrl) {
      setStories((prev) =>
        prev.map((s) => (s.mine ? { ...s, avatar: userActiveAvatarUrl } : s))
      );
    }
  }, [userActiveAvatarUrl]);

  // Load and apply custom font dynamically
  useEffect(() => {
    const fontId = advSettings.selectedFontId || localStorage.getItem('nexa_selected_font_id') || 'inter';
    const fontObj = FONT_CATALOG.find((f) => f.id === fontId) || FONT_CATALOG[28];
    loadGoogleFont(fontObj.name);
    document.documentElement.style.setProperty('--app-font-family', fontObj.family);
  }, [advSettings.selectedFontId]);

  const [isStatusEditorOpen, setIsStatusEditorOpen] = useState<boolean>(false);
  const [viewingStoryId, setViewingStoryId] = useState<string | number | null>(null);

  const [dpPreviewTarget, setDpPreviewTarget] = useState<ProfilePreviewTarget | null>(null);
  const [dpPreviewInitialMode, setDpPreviewInitialMode] = useState<'card' | 'fullscreen'>('card');

  // Wallpaper & Chat Context Action States
  const [globalWallpaper, setGlobalWallpaper] = useState<string>('radial-gradient(circle at 50% 50%, #0d1e28 0%, #0b141a 100%)');
  const [globalWallpaperDim, setGlobalWallpaperDim] = useState<number>(20);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState<boolean>(false);

  const handleApplyWallpaper = (background: string, dim: number, applyToAll: boolean) => {
    if (applyToAll) {
      setGlobalWallpaper(background);
      setGlobalWallpaperDim(dim);
      setChats((prev) => prev.map((c) => ({ ...c, wallpaper: undefined, wallpaperDim: undefined })));
      setGroups((prev) => prev.map((g) => ({ ...g, wallpaper: undefined, wallpaperDim: undefined })));
      setChannels((prev) => prev.map((ch) => ({ ...ch, wallpaper: undefined, wallpaperDim: undefined })));
    } else if (activeId) {
      const updater = (list: ChatRoom[]) =>
        list.map((item) => (item.id === activeId ? { ...item, wallpaper: background, wallpaperDim: dim } : item));
      setChats(updater);
      setGroups(updater);
      setChannels(updater);
    }
  };

  const handleClearChat = () => {
    if (activeId) {
      setMessages((prev) => ({ ...prev, [activeId]: [] }));
    }
  };

  const handleBlockUser = () => {
    if (activeRoom) {
      const updater = (list: ChatRoom[]) =>
        list.map((item) => (item.id === activeRoom.id ? { ...item, blocked: true } : item));
      setChats(updater);
    }
  };

  const handleExitGroup = () => {
    if (activeRoom) {
      const updater = (list: ChatRoom[]) =>
        list.map((item) => (item.id === activeRoom.id ? { ...item, left: true } : item));
      setGroups(updater);
    }
  };

  const handleMuteRoom = (duration: string) => {
    if (activeRoom) {
      const isMuted = duration !== 'Off';
      const updater = (list: ChatRoom[]) =>
        list.map((item) => (item.id === activeRoom.id ? { ...item, muted: isMuted } : item));
      setChats(updater);
      setGroups(updater);
      setChannels(updater);
    }
  };

  const handleSetDisappearingTimer = (timer: string) => {
    if (activeRoom) {
      const updater = (list: ChatRoom[]) =>
        list.map((item) => (item.id === activeRoom.id ? { ...item, disappearingTimer: timer } : item));
      setChats(updater);
      setGroups(updater);
    }
  };

  const handleUnfollowChannel = () => {
    if (activeRoom) {
      setChannels((prev) => prev.filter((ch) => ch.id !== activeRoom.id));
      setActiveId(null);
    }
  };

  const handlePreviewDp = (target: { id?: string | number; name: string; avatar?: string }) => {
    setDpPreviewTarget(target);
    setDpPreviewInitialMode('card');
  };

  const handleOpenFullScreenDp = (target: { name: string; avatar?: string }) => {
    setDpPreviewTarget(target);
    setDpPreviewInitialMode('fullscreen');
  };

  const handleStartDeveloperChat = () => {
    setDrawerOpen(false);
    const devChatId = 'dev_team_chat';
    const existing = chats.find((c) => c.id === devChatId);
    if (!existing) {
      const newDevRoom = {
        id: devChatId,
        name: 'The Great Minds (Developers)',
        time: 'Just now',
        snippet: 'Welcome to NEXA Developer Support! How can we help you?',
        unread: 0,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        type: 'direct' as const,
        online: true,
        lastSeen: 'Online',
        about: 'Lead Developers of NEXA App (hpro453176@gmail.com)',
      };
      setChats((prev) => [newDevRoom, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [devChatId]: [
          {
            id: 'dev_m1',
            sender: 'The Great Minds (Developers)',
            text: 'Hello! You are directly connected with The Great Minds development team (Lead email: hpro453176@gmail.com). How can we assist you today with NEXA App?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read' as const,
          },
        ],
      }));
    }
    setActiveId(devChatId);
    showToast('Connected to NEXA Developer Support');
  };

  const showToast = (msg: string | ToastState, actionLabel?: string, onAction?: () => void) => {
    if (typeof msg === 'string') {
      setToastState({ message: msg, actionLabel, onAction });
    } else {
      setToastState(msg);
    }
    setTimeout(() => {
      setToastState(null);
    }, 3500);
  };

  const handlePostStatus = (newItem: StatusItem) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.mine) {
          const currentItems = s.items || [];
          return {
            ...s,
            items: [newItem, ...currentItems],
            timeAgo: 'Just now',
            seen: false,
          };
        }
        return s;
      })
    );
    showToast('Status update posted successfully! 🎉');
  };

  const handleViewStory = (story: Story) => {
    setViewingStoryId(story.id);
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, seen: true } : s))
    );
  };

  const handleReplyToStory = (contactName: string, replyText: string) => {
    const targetChat = chats.find((c) => c.name.toLowerCase().includes(contactName.toLowerCase())) || chats[0];
    if (targetChat) {
      const now = new Date();
      const t =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0');
      const newMsg: ChatMessage = {
        from: 'me',
        type: 'text',
        text: replyText,
        time: t,
        status: 'sent',
      };
      setMessages((prev) => ({
        ...prev,
        [targetChat.id]: [...(prev[targetChat.id] || []), newMsg],
      }));
      showToast(`Reply sent to ${contactName} in chat`);
    } else {
      showToast(`Replied to ${contactName}: ${replyText}`);
    }
  };

  const handleDeleteStatusItem = (storyId: string | number, itemId: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const updated = (s.items || []).filter((it) => it.id !== itemId);
          return {
            ...s,
            items: updated,
          };
        }
        return s;
      })
    );
    showToast('Status update deleted');
  };

  const allRooms = [...chats, ...groups, ...channels];
  const activeRoom = allRooms.find((r) => r.id === activeId) || null;
  const activeMessages = activeId ? messages[activeId] || [] : [];

  const handleSelectSection = (newSec: AppSection) => {
    setSection(newSec);
  };

  const handleSelectChat = (id: string) => {
    setActiveId(id);
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, unread: 0 } : g))
    );
  };

  const handleAskGreatMindsAI = (query: string) => {
    setActiveId('greatminds_ai');
    setSection('chats');
    handleSendMessage(query);
  };

  const getCurrentTimeString = (): string => {
    const now = new Date();
    return (
      now.getHours().toString().padStart(2, '0') +
      ':' +
      now.getMinutes().toString().padStart(2, '0')
    );
  };

  const handleSendMessage = (text: string, replyQuote?: string) => {
    if (!activeId) return;

    const t = getCurrentTimeString();
    const isVoice = text.startsWith('🎤 Voice Message');
    let durStr = '0:18';
    if (isVoice) {
      const match = text.match(/\(([^)]+)\)/);
      if (match) durStr = match[1];
    }

    const newMsg: ChatMessage = isVoice
      ? {
          from: 'me',
          type: 'voice',
          dur: durStr,
          time: t,
          status: 'sent',
          replyText: replyQuote,
        }
      : {
          from: 'me',
          type: 'text',
          text,
          time: t,
          status: 'sent',
          replyText: replyQuote,
        };

    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));

    // Update room last message
    const lastDisplay = isVoice ? `🎤 Voice message (${durStr})` : text;
    const updateRoomLast = (list: ChatRoom[]) =>
      list.map((r) => (r.id === activeId ? { ...r, last: lastDisplay, time: t } : r));

    setChats(updateRoomLast);
    setGroups(updateRoomLast);
    setChannels(updateRoomLast);

    // Handle Great Minds AI queries
    const isGreatMindsQuery = activeId === 'greatminds_ai' || text.toLowerCase().includes('great minds ai') || text.toLowerCase().includes('@greatminds');

    if (isGreatMindsQuery) {
      setTimeout(async () => {
        setIsTyping(true);
        const currentMsgs = messages[activeId] || [];
        const contextHistory = currentMsgs.slice(-6).map((m) => ({ sender: m.from === 'me' ? 'User' : 'Great Minds AI', text: m.text || '' }));
        const aiRes = await askGreatMindsAI(text, contextHistory);
        setIsTyping(false);

        const replyTime = getCurrentTimeString();
        const replyMsg: ChatMessage = {
          from: 'them',
          name: 'Great Minds AI',
          avatar: 'greatminds_ai',
          type: 'text',
          text: aiRes.text,
          time: replyTime,
        };

        setMessages((prev) => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), replyMsg],
        }));

        const updateRoomAI = (list: ChatRoom[]) =>
          list.map((r) =>
            r.id === activeId
              ? {
                  ...r,
                  last: aiRes.text.replace(/[*#_`]/g, '').slice(0, 60),
                  time: replyTime,
                  unread: 0,
                }
              : r
          );

        setChats(updateRoomAI);
        setGroups(updateRoomAI);
      }, 1000);

      return;
    }

    // Simulate status transition: sent -> delivered -> read -> typing -> auto reply
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] || []).map((m, idx, arr) =>
          idx === arr.length - 1 ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 600);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeId]: (prev[activeId] || []).map((m, idx, arr) =>
          idx === arr.length - 1 ? { ...m, status: 'read' } : m
        ),
      }));
      setIsTyping(true);
    }, 1400);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = getCurrentTimeString();
      const replyMsg: ChatMessage = {
        from: 'them',
        type: 'text',
        text: replyText,
        time: replyTime,
      };

      setMessages((prev) => ({
        ...prev,
        [activeId]: [...(prev[activeId] || []), replyMsg],
      }));

      // Update room state on incoming reply (including Unmuted vs Muted archiving logic)
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            // Unmuted chats auto-unarchive on new incoming message!
            // Muted chats stay archived!
            const shouldUnarchive = c.archived && !c.muted;
            return {
              ...c,
              last: replyText,
              time: replyTime,
              archived: shouldUnarchive ? false : c.archived,
            };
          }
          return c;
        })
      );
    }, 2800);
  };

  const handleSendAttachment = (
    type: 'photo' | 'doc' | 'poll' | 'location' | 'contact' | 'sketch' | 'sticker' | 'zip'
  ) => {
    if (!activeId) return;
    const t = getCurrentTimeString();
    let m: ChatMessage;

    if (type === 'photo') m = { from: 'me', type: 'text', text: '[Photo attached]', time: t, status: 'sent' };
    else if (type === 'doc') m = { from: 'me', type: 'doc', name: 'proposal-final.docx', size: '480 KB', time: t, status: 'sent' };
    else if (type === 'poll') m = { from: 'me', type: 'poll', question: 'Quick poll', options: [['Option A', 55], ['Option B', 45]], time: t };
    else if (type === 'location') m = { from: 'me', type: 'location', label: 'Static Location · shared', time: t, status: 'sent' };
    else if (type === 'contact') m = { from: 'me', type: 'contact', cname: 'Jordan Blake', cphone: '+1 555 0102', time: t, status: 'sent' };
    else if (type === 'sketch') m = { from: 'me', type: 'sketch', time: t, status: 'sent' };
    else if (type === 'sticker') m = { from: 'me', type: 'sticker', emoji: '🔥', time: t };
    else m = { from: 'me', type: 'doc', name: 'archive.zip', size: '12.4 MB', time: t, status: 'sent' };

    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), m],
    }));
  };

  const handleSendSticker = (sticker: { name: string; animatedSvg?: string; lottieUrl?: string; previewEmoji: string }) => {
    if (!activeId) return;
    const t = getCurrentTimeString();
    const stickerMsg: ChatMessage = {
      from: 'me',
      type: 'sticker',
      emoji: sticker.previewEmoji,
      stickerData: {
        name: sticker.name,
        animatedSvg: sticker.animatedSvg,
        lottieUrl: sticker.lottieUrl,
      },
      time: t,
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), stickerMsg],
    }));

    const updateRoomLast = (list: ChatRoom[]) =>
      list.map((r) => (r.id === activeId ? { ...r, last: `[Sticker] ${sticker.name}`, time: t } : r));

    setChats(updateRoomLast);
    setGroups(updateRoomLast);
    setChannels(updateRoomLast);
  };

  const handleReactMessage = (msgIndex: number, emoji: string) => {
    if (!activeId) return;
    setMessages((prev) => {
      const list = prev[activeId] || [];
      const updated = list.map((m, idx) => {
        if (idx === msgIndex) {
          const currentReactions = m.reactions || [];
          if (!currentReactions.includes(emoji)) {
            return { ...m, reactions: [...currentReactions, emoji] };
          }
        }
        return m;
      });
      return { ...prev, [activeId]: updated };
    });
  };

  const handleDeleteMessage = (msgIndex: number) => {
    if (!activeId) return;
    setMessages((prev) => {
      const list = prev[activeId] || [];
      const updated = list.filter((_, idx) => idx !== msgIndex);
      return { ...prev, [activeId]: updated };
    });
    showToast('Deleted for me');
  };

  const handleTranslateMessage = async (msgIndex: number, targetLang: string) => {
    if (!activeId) return;

    // Set loading indicator
    setMessages((prev) => {
      const list = prev[activeId] || [];
      return {
        ...prev,
        [activeId]: list.map((m, idx) => (idx === msgIndex ? { ...m, isTranslating: true } : m)),
      };
    });

    const currentList = messages[activeId] || [];
    const targetMsg = currentList[msgIndex];
    if (!targetMsg || !targetMsg.text) return;

    try {
      const res = await translateText(targetMsg.text, targetLang);
      setMessages((prev) => {
        const list = prev[activeId] || [];
        return {
          ...prev,
          [activeId]: list.map((m, idx) => {
            if (idx === msgIndex) {
              return {
                ...m,
                isTranslating: false,
                translatedText: res.text,
                translatedLang: targetLang,
                detectedSourceLang: res.detectedSource,
                translationEngine: res.engine,
                showOriginal: false,
              };
            }
            return m;
          }),
        };
      });
    } catch (err) {
      setMessages((prev) => {
        const list = prev[activeId] || [];
        return {
          ...prev,
          [activeId]: list.map((m, idx) => (idx === msgIndex ? { ...m, isTranslating: false } : m)),
        };
      });
      showToast('Translation error');
    }
  };

  const handleToggleOriginalMessage = (msgIndex: number) => {
    if (!activeId) return;
    setMessages((prev) => {
      const list = prev[activeId] || [];
      return {
        ...prev,
        [activeId]: list.map((m, idx) => (idx === msgIndex ? { ...m, showOriginal: !m.showOriginal } : m)),
      };
    });
  };

  const handleSelectAccent = (idx: number) => {
    const [c1, c2] = ACCENTS[idx % ACCENTS.length].split(',');
    document.documentElement.style.setProperty('--accent-1', c1);
    document.documentElement.style.setProperty('--accent-2', c2);
  };

  const handleToggleArchive = (id: string) => {
    let chatName = '';
    let isCurrentlyArchived = false;

    setChats((prev) => {
      const chat = prev.find((c) => c.id === id);
      if (chat) {
        chatName = chat.name;
        isCurrentlyArchived = !!chat.archived;
      }
      return prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c));
    });

    if (isCurrentlyArchived) {
      showToast(`Unarchived ${chatName || 'chat'}`, 'UNDO', () => handleToggleArchive(id));
    } else {
      showToast('Chat Archived', 'UNDO', () => handleToggleArchive(id));
    }
  };

  const handleUnarchiveAllChats = () => {
    const archivedIds: string[] = [];
    setChats((prev) => {
      prev.forEach((c) => {
        if (c.archived) archivedIds.push(c.id);
      });
      return prev.map((c) => ({ ...c, archived: false }));
    });

    showToast('All chats unarchived', 'UNDO', () => {
      setChats((prev) =>
        prev.map((c) => (archivedIds.includes(c.id) ? { ...c, archived: true } : c))
      );
    });
  };

  const handleMarkAllArchivedRead = () => {
    setChats((prev) =>
      prev.map((c) => (c.archived ? { ...c, unread: 0 } : c))
    );
    showToast('All archived messages marked as read');
  };

  const handleToggleMute = (id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c))
    );
  };

  const handleTogglePin = (id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleToggleArchivePin = (id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archivedPinned: !c.archivedPinned } : c))
    );
  };

  const handleBulkPinChats = (ids: string[]) => {
    setChats((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, pinned: !c.pinned } : c))
    );
    showToast(`Updated pin status for ${ids.length} chat${ids.length > 1 ? 's' : ''}`);
  };

  const handleBulkMuteChats = (ids: string[]) => {
    setChats((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, muted: !c.muted } : c))
    );
    showToast(`Updated mute status for ${ids.length} chat${ids.length > 1 ? 's' : ''}`);
  };

  const handleBulkArchiveChats = (ids: string[]) => {
    setChats((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, archived: !c.archived } : c))
    );
    showToast(`Archived ${ids.length} chat${ids.length > 1 ? 's' : ''}`, 'UNDO', () => {
      setChats((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, archived: !c.archived } : c))
      );
    });
  };

  const handleBulkDeleteChats = (ids: string[]) => {
    const deletedChats = chats.filter((c) => ids.includes(c.id));
    setChats((prev) => prev.filter((c) => !ids.includes(c.id)));
    if (activeId && ids.includes(activeId)) {
      setActiveId(null);
    }
    showToast(`Deleted ${ids.length} chat${ids.length > 1 ? 's' : ''}`, 'UNDO', () => {
      setChats((prev) => [...prev, ...deletedChats]);
    });
  };

  const handleBulkMarkReadChats = (ids: string[]) => {
    setChats((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, unread: 0 } : c))
    );
    showToast(`Marked ${ids.length} chat${ids.length > 1 ? 's' : ''} as read`);
  };

  const handleBulkAddToFolder = (ids: string[], folderName: string) => {
    showToast(`Added ${ids.length} chat${ids.length > 1 ? 's' : ''} to folder "${folderName}"`);
  };

  return (
    <div className="app">
      <RailNav
        activeSection={section}
        onSelectSection={handleSelectSection}
        onOpenSettings={() => {
          setDrawerMode('settings');
          setDrawerOpen(true);
        }}
        onOpenProfile={() => {
          setDrawerMode('settings');
          setDrawerOpen(true);
        }}
        onOpenGreatMindsAI={() => handleSelectChat('greatminds_ai')}
        userInitials={profile.name ? profile.name.slice(0, 2).toUpperCase() : 'YOU'}
        userAvatarUrl={
          (profile.avatars.find((a) => a.id === profile.activeAvatarId) || profile.avatars[0])?.url
        }
        isHiddenOnMobile={!!activeId}
        interfaceLang={advSettings.interfaceLanguage || 'en'}
      />

      <ListPanel
        section={section}
        chats={chats}
        groups={groups}
        channels={channels}
        communities={communities}
        mail={mail}
        stories={stories}
        messages={messages}
        activeId={activeId}
        activeMailFolder={activeMailFolder}
        interfaceLang={advSettings.interfaceLanguage || 'en'}
        onSelectChat={handleSelectChat}
        onSelectMailFolder={setActiveMailFolder}
        onToggleArchive={handleToggleArchive}
        onToggleMute={handleToggleMute}
        onTogglePin={handleTogglePin}
        onToggleArchivePin={handleToggleArchivePin}
        onUnarchiveAll={handleUnarchiveAllChats}
        onMarkAllArchivedRead={handleMarkAllArchivedRead}
        onBulkPinChats={handleBulkPinChats}
        onBulkMuteChats={handleBulkMuteChats}
        onBulkArchiveChats={handleBulkArchiveChats}
        onBulkDeleteChats={handleBulkDeleteChats}
        onBulkMarkReadChats={handleBulkMarkReadChats}
        onBulkAddToFolder={handleBulkAddToFolder}
        onOpenArchiveSettings={() => {
          setDrawerMode('settings');
          setDrawerOpen(true);
        }}
        onNewAction={() => {
          if (section === 'stories') {
            setIsStatusEditorOpen(true);
          } else {
            showToast(`New ${section.slice(0, -1)} — creation flow.`);
          }
        }}
        onViewStory={handleViewStory}
        onCreateStatus={() => setIsStatusEditorOpen(true)}
        onPreviewDp={handlePreviewDp}
        showStoryTrayInChats={advSettings.showStoryTrayInChats ?? true}
        onAskGreatMindsAI={handleAskGreatMindsAI}
        onOpenGreatMindsVoiceModal={() => setIsVoiceModalOpen(true)}
        onToast={showToast}
        isHiddenOnMobile={!!activeId}
      />

      <ChatPanel
        activeRoom={activeRoom}
        messages={activeMessages}
        isTyping={isTyping}
        targetLang={advSettings.targetLanguage || advSettings.interfaceLanguage || 'en'}
        interfaceLang={advSettings.interfaceLanguage || 'en'}
        userAvatarUrl={userActiveAvatarUrl}
        userInitials={profile.name ? profile.name.slice(0, 2).toUpperCase() : 'YOU'}
        globalWallpaper={globalWallpaper}
        globalWallpaperDim={globalWallpaperDim}
        onSetTargetLang={(lang) => setAdvSettings((prev) => ({ ...prev, targetLanguage: lang }))}
        onTranslateMessage={handleTranslateMessage}
        onToggleOriginalMessage={handleToggleOriginalMessage}
        onSendMessage={handleSendMessage}
        onSendAttachment={handleSendAttachment}
        onSendSticker={handleSendSticker}
        onReactMessage={handleReactMessage}
        onDeleteMessage={handleDeleteMessage}
        onOpenProfile={() => {
          setDrawerMode('contact');
          setDrawerOpen(true);
        }}
        onBackMobile={() => setActiveId(null)}
        onToast={showToast}
        onApplyWallpaper={handleApplyWallpaper}
        onClearChat={handleClearChat}
        onBlockUser={handleBlockUser}
        onExitGroup={handleExitGroup}
        onMuteRoom={handleMuteRoom}
        onSetDisappearingTimer={handleSetDisappearingTimer}
        onUnfollowChannel={handleUnfollowChannel}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        isHiddenOnMobile={!activeId}
      />

      <Drawer
        isOpen={drawerOpen}
        mode={drawerMode}
        activeRoom={activeRoom}
        profile={profile}
        advSettings={advSettings}
        currentTheme={currentTheme}
        toggleStates={toggleStates}
        selectedRadioStates={selectedRadioStates}
        bubbleRadius={bubbleRadius}
        fontScale={fontScale}
        onClose={() => setDrawerOpen(false)}
        onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        onUpdateAdvSettings={(updated) => setAdvSettings((prev) => ({ ...prev, ...updated }))}
        onSelectTheme={setCurrentTheme}
        onSelectAccent={handleSelectAccent}
        onSetBubbleRadius={setBubbleRadius}
        onSetFontScale={setFontScale}
        onToggleChange={(key, val) => setToggleStates((prev) => ({ ...prev, [key]: val }))}
        onRadioChange={(key, idx) => setSelectedRadioStates((prev) => ({ ...prev, [key]: idx }))}
        onToast={showToast}
        onOpenFontSelector={() => setIsFontModalOpen(true)}
        onOpenWallpaperPicker={() => setIsWallpaperModalOpen(true)}
        onOpenFullScreenDp={handleOpenFullScreenDp}
        onStartDeveloperChat={handleStartDeveloperChat}
        onOpenOnboarding={(stg) => {
          setOnboardingStage(stg || 'splash');
          setShowOnboarding(true);
        }}
        onLogout={() => {
          localStorage.removeItem('nexa_is_authenticated');
          setIsAuthenticated(false);
          setOnboardingStage('splash');
          setShowOnboarding(true);
          showToast('Logged out of Nexa account successfully');
        }}
      />

      {/* Telegram-Style Splash & Onboarding Auth Screen */}
      {(!isAuthenticated || showOnboarding) && (
        <OnboardingAuthScreen
          initialStage={onboardingStage}
          isAuthenticated={isAuthenticated}
          onCompleteAuth={(userData) => {
            setIsAuthenticated(true);
            setShowOnboarding(false);
            localStorage.setItem('nexa_is_authenticated', 'true');
            if (userData.name) {
              setProfile((prev) => ({
                ...prev,
                name: userData.name,
                username: userData.username || prev.username,
                phone: userData.phone || prev.phone,
                ...(userData.avatarUrl
                  ? {
                      avatars: [{ id: `custom_${Date.now()}`, url: userData.avatarUrl, name: 'Custom Photo' }, ...prev.avatars],
                      activeAvatarId: `custom_${Date.now()}`,
                    }
                  : {}),
              }));
            }
          }}
          onToast={showToast}
          onClose={isAuthenticated ? () => setShowOnboarding(false) : undefined}
        />
      )}

      {/* Global Wallpaper Picker Triggered from Settings */}
      {isWallpaperModalOpen && (
        <WallpaperPickerModal
          roomName={activeRoom?.name}
          currentBg={globalWallpaper}
          currentDim={globalWallpaperDim}
          onApplyWallpaper={(bg, dim, applyAll) => {
            handleApplyWallpaper(bg, dim, applyAll);
            showToast('General chat wallpaper updated!');
          }}
          onClose={() => setIsWallpaperModalOpen(false)}
          onToast={showToast}
        />
      )}

      <FontSelectorModal
        isOpen={isFontModalOpen}
        activeFontId={advSettings.selectedFontId || 'inter'}
        onSelectFont={(fontOption) => {
          setAdvSettings((prev) => ({
            ...prev,
            selectedFontId: fontOption.id,
            fontFamily: fontOption.family,
          }));
          localStorage.setItem('nexa_selected_font_id', fontOption.id);
          showToast(`Font changed to ${fontOption.name} (${fontOption.category})`);
        }}
        onClose={() => setIsFontModalOpen(false)}
      />

      {/* WhatsApp Status Editor Modal */}
      {isStatusEditorOpen && (
        <StatusEditorModal
          userAvatarUrl={userActiveAvatarUrl}
          userName={profile.name}
          onClose={() => setIsStatusEditorOpen(false)}
          onPostStatus={handlePostStatus}
        />
      )}

      {/* WhatsApp Status Viewer Player Modal */}
      {viewingStoryId !== null && (
        <StatusViewerModal
          stories={stories}
          initialStoryId={viewingStoryId}
          onClose={() => setViewingStoryId(null)}
          onReplyToStory={handleReplyToStory}
          onDeleteStatusItem={handleDeleteStatusItem}
        />
      )}

      {/* WhatsApp DP Quick Preview & Full Screen Modal */}
      {dpPreviewTarget !== null && (
        <ProfilePreviewModal
          target={dpPreviewTarget}
          initialMode={dpPreviewInitialMode}
          onClose={() => setDpPreviewTarget(null)}
          onOpenChat={(tgt) => {
            if (tgt.id) {
              handleSelectChat(String(tgt.id));
            } else {
              showToast(`Opening chat with ${tgt.name}...`);
            }
          }}
          onVoiceCall={(tgt) => showToast(`Initiating audio call with ${tgt.name}...`)}
          onVideoCall={(tgt) => showToast(`Initiating video call with ${tgt.name}...`)}
          onOpenInfo={() => {
            setDrawerMode('contact');
            setDrawerOpen(true);
          }}
        />
      )}

      <Toast toast={toastState} onDismiss={() => setToastState(null)} />

      {/* Great Minds AI Voice Mode Modal */}
      <GreatMindsVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendMessage={handleSendMessage}
        onToast={showToast}
      />
    </div>
  );
}
