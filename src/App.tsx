import React, { useState, useEffect } from 'react';
import { AppSection, ChatRoom, ChatMessage, MailFolder, MailItem, Story, UserProfile, AdvancedSettingsState, ThemeOption } from './types';
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
    bio: 'Building things that connect people. Check @nexa_official or https://nexa.app!',
    phone: '+1 555 0100',
    avatars: [
      {
        id: 'av1',
        url: 'linear-gradient(135deg, #FF9A6F, #FF5376)',
        isVideo: false,
        createdAt: 'Today',
      },
      {
        id: 'av2',
        url: 'linear-gradient(135deg, #00F0FF, #9000FF)',
        isVideo: true,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-particles-background-41553-large.mp4',
        createdAt: '2 days ago',
      },
      {
        id: 'av3',
        url: 'linear-gradient(135deg, #6FF5C6, #4C8DFF)',
        isVideo: false,
        isPublicPhoto: true,
        createdAt: '1 week ago',
      },
    ],
    activeAvatarId: 'av1',
    publicAvatarId: 'av3',
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
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
        onNewAction={() => showToast(`New ${section.slice(0, -1)} — creation flow.`)}
        onToast={showToast}
        isHiddenOnMobile={!!activeId}
      />

      <ChatPanel
        activeRoom={activeRoom}
        messages={activeMessages}
        isTyping={isTyping}
        targetLang={advSettings.targetLanguage || advSettings.interfaceLanguage || 'en'}
        interfaceLang={advSettings.interfaceLanguage || 'en'}
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
      />

      <Toast message={toastMessage} />
    </div>
  );
}
