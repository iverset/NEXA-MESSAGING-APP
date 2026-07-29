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
import { Toast } from './components/Toast';
import { FontSelectorModal } from './components/FontSelectorModal';
import { StatusEditorModal } from './components/StatusEditorModal';
import { StatusViewerModal } from './components/StatusViewerModal';
import { ProfilePreviewModal, ProfilePreviewTarget } from './components/ProfilePreviewModal';
import { WallpaperPickerModal } from './components/WallpaperPickerModal';
import { FONT_CATALOG, loadGoogleFont } from './data/fontsCatalog';
import { translateText } from './services/translator';

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
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [selectedRadioStates, setSelectedRadioStates] = useState<Record<string, number>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
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
    const newMsg: ChatMessage = {
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
    const updateRoomLast = (list: ChatRoom[]) =>
      list.map((r) => (r.id === activeId ? { ...r, last: text, time: t } : r));

    setChats(updateRoomLast);
    setGroups(updateRoomLast);
    setChannels(updateRoomLast);

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

      // Update room state on incoming reply (Unmuted vs Muted archive behaviour)
      let popped = false;
      let poppedName = '';

      setChats((prev) => {
        const next = prev.map((c) => {
          if (c.id !== activeId) return c;

          // An unmuted archived chat escapes the archive on a new message.
          // A muted one stays locked inside and only bumps the archive counter.
          const shouldUnarchive = !!c.archived && !c.muted;
          if (shouldUnarchive) {
            popped = true;
            poppedName = c.name;
          }
          return {
            ...c,
            last: replyText,
            time: replyTime,
            archived: shouldUnarchive ? false : c.archived,
            archivedPinned: shouldUnarchive ? false : c.archivedPinned,
            // Muted archived chats accrue unread silently.
            unread: c.archived && c.muted ? (c.unread || 0) + 1 : c.unread,
          };
        });

        // An unarchived chat moves back to the top of the main list.
        if (popped) {
          const idx = next.findIndex((c) => c.id === activeId);
          if (idx > -1) {
            const [row] = next.splice(idx, 1);
            next.unshift(row);
          }
        }
        return next;
      });

      if (popped) {
        showToast(`${poppedName} moved out of Archive — new message`);
      }
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
    setChats((prev) => {
      const next = prev.map((c) => {
        if (c.id !== id) return c;
        const nowArchived = !c.archived;
        return {
          ...c,
          archived: nowArchived,
          // Archiving a chat drops its main-list pin; unarchiving drops its archive pin.
          pinned: nowArchived ? false : c.pinned,
          archivedPinned: nowArchived ? c.archivedPinned : false,
        };
      });

      // Unarchived chats return to the top of the main list.
      const row = next.find((c) => c.id === id);
      if (row && !row.archived) {
        const idx = next.findIndex((c) => c.id === id);
        next.splice(idx, 1);
        next.unshift(row);
      }
      return next;
    });

    // Leaving the archived thread open would strand the user on a hidden chat.
    if (activeId === id) setActiveId(null);
  };

  const handleUnarchiveAll = () => {
    const count = chats.filter((c) => c.archived).length;
    if (count === 0) {
      showToast('Archive is already empty');
      return;
    }
    setChats((prev) => prev.map((c) => (c.archived ? { ...c, archived: false, archivedPinned: false } : c)));
    showToast(`Unarchived ${count} chat${count > 1 ? 's' : ''}`);
  };

  const handleMarkArchivedRead = () => {
    const count = chats.filter((c) => c.archived && (c.unread || 0) > 0).length;
    if (count === 0) {
      showToast('No unread chats in Archive');
      return;
    }
    setChats((prev) => prev.map((c) => (c.archived ? { ...c, unread: 0 } : c)));
    showToast(`Marked ${count} archived chat${count > 1 ? 's' : ''} as read`);
  };

  const handleOpenArchiveSettings = () => {
    setDrawerMode('settings');
    setDrawerOpen(true);
    showToast('Archive settings — see Privacy');
  };

  // Simulates an inbound message from a non-contact so the
  // "Auto-Archive Unknown Senders" privacy rule can be observed.
  const handleSimulateUnknownSender = () => {
    const stamp = Date.now();
    const id = `u${stamp}`;
    const autoArchive = !!advSettings.autoArchiveUnknown;
    const name = `+256 78${String(stamp).slice(-6)}`;
    const text = 'Hello, you have won a promotional airtime bonus. Reply YES to claim.';
    const time = getCurrentTimeString();

    const room: ChatRoom = {
      id,
      name,
      avatar: '',
      online: false,
      unread: 1,
      pinned: false,
      isUnknownSender: true,
      // The setting both mutes and archives non-contacts.
      muted: autoArchive,
      archived: autoArchive,
      last: text,
      time,
    };

    setMessages((prev) => ({ ...prev, [id]: [{ from: 'them', type: 'text', text, time }] }));
    setChats((prev) => (autoArchive ? [...prev, room] : [room, ...prev]));

    showToast(
      autoArchive
        ? `Unknown sender ${name} auto-archived and muted`
        : `New message from unknown sender ${name}`
    );
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
        activeId={activeId}
        activeMailFolder={activeMailFolder}
        interfaceLang={advSettings.interfaceLanguage || 'en'}
        onSelectChat={handleSelectChat}
        onSelectMailFolder={setActiveMailFolder}
        onToggleArchive={handleToggleArchive}
        onToggleMute={handleToggleMute}
        onTogglePin={handleTogglePin}
        onToggleArchivePin={handleToggleArchivePin}
        onUnarchiveAll={handleUnarchiveAll}
        onMarkArchivedRead={handleMarkArchivedRead}
        onOpenArchiveSettings={handleOpenArchiveSettings}
        onSimulateUnknownSender={handleSimulateUnknownSender}
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
      />

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

      <Toast message={toastMessage} />
    </div>
  );
}
