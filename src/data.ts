import { ChatRoom, ChatMessage, MailItem, Story, ThemeOption, WhatsAppTheme } from './types';

export const PALETTES = [
  '#6FF5C6,#4C8DFF',
  '#FF9A6F,#FF6F59',
  '#B388FF,#6FE0FF',
  '#FFD36F,#FF9A6F',
  '#6FE0C2,#3FB6A8',
  '#FF8FB1,#B388FF',
  '#8FE6FF,#4C8DFF',
  '#FFD36F,#6FF5C6'
];

export function getPaletteGrad(i: number): string {
  const p = PALETTES[i % PALETTES.length].split(',');
  return `linear-gradient(135deg, ${p[0]}, ${p[1]})`;
}

export const INITIAL_CHATS: ChatRoom[] = [
  { id: 'c1', name: 'Kato Mukasa', username: 'kato_mukasa', phone: '+256 752 111222', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=75', online: true, unread: 2, pinned: true, muted: false, last: 'Oli otya! Sent the files, check inbox', time: '09:41' },
  { id: 'c2', name: 'Babirye Kintu', username: 'babirye_kintu', phone: '+256 772 333444', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=75', online: false, unread: 0, pinned: false, muted: true, last: '🎤 Voice message (0:42) - Ki gano Mukwano!', time: '08:12' },
  { id: 'c3', name: 'Ssemwanga Ronald', username: 'ronald_ssemwanga', phone: '+256 701 555666', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=75', online: true, unread: 0, pinned: false, muted: false, last: 'That sketch of the Buganda motif looks great!', time: 'Yesterday' },
  { id: 'c4', name: 'Namubiru Sarah', username: 'sarah_namubiru', phone: '+256 782 777888', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=75', online: false, unread: 5, pinned: false, muted: false, last: '📍 Live location shared · Kampala Road', time: 'Yesterday' },
  { id: 'c5', name: 'Kizza Aloysius', username: 'kizza_aloysius', phone: '+256 755 999000', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=75', online: true, unread: 0, pinned: false, muted: false, last: 'Poll: Pick the launch date for Kampala App', time: 'Mon' },
];

export const INITIAL_GROUPS: ChatRoom[] = [
  { id: 'g1', name: 'Kampala Tech Hub 🇺🇬', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=75', members: 128, unread: 12, last: 'Kato: Updated the brand tokens doc for our app.' },
  { id: 'g2', name: 'Buganda Royal Fraternity 👑', avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=120&q=75', members: 45, unread: 0, last: 'Ssemwanga: Meeting tomorrow at Bulange Mengo at 9:00 AM.' },
  { id: 'g3', name: 'Clan Elders Forum 🌿', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=120&q=75', members: 320, unread: 3, last: 'Sekatte: Traditional customs handbook pinned above.' },
];

export const INITIAL_CHANNELS: ChatRoom[] = [
  { id: 'ch1', name: 'Uganda Tech News 📰', avatar: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=120&q=75', type: 'Public', subs: '44.2k', last: 'New: Mobile money integrations rolling out across East Africa.' },
  { id: 'ch2', name: 'Buganda Heritage & Arts 🎨', avatar: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=120&q=75', type: 'Public', subs: '9.8k', last: 'On traditional Lubugo barkcloth weaving and design rhythm.' },
  { id: 'ch3', name: 'Kampala Developers Network 💻', avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=120&q=75', type: 'Private', subs: '1.2k', last: 'Q3 Kampala Hackathon milestones attached.' },
];

export const INITIAL_COMMUNITIES: ChatRoom[] = [
  { id: 'co1', name: 'Buganda Innovation Hub', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=75', groups: 6, channels: 3, desc: 'Empowering tech entrepreneurs across Buganda & Uganda.', last: '' },
  { id: 'co2', name: 'Kampala Creatives & Artists', avatar: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=120&q=75', groups: 11, channels: 2, desc: 'Local Baganda artists, musicians, designers & meetups.', last: '' },
];

export const INITIAL_MAIL: Record<string, MailItem[]> = {
  inbox: [
    { id: 'm1', from: 'Kato Mukasa', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=75', subject: 'Kampala App deck — final review', snippet: 'Webale nnyo! Left a couple comments on slide 4, ready for launch.', time: '09:12', unread: true },
    { id: 'm2', from: 'Buganda Tech Guild', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=75', subject: 'Your weekly activity summary', snippet: 'You sent 214 messages and joined 2 new communities in Kampala.', time: 'Yesterday', unread: false },
    { id: 'm3', from: 'Namubiru Sarah', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=75', subject: 'Invoice #2291 - Kampala Hub', snippet: 'Attached is the invoice for last month development.', time: 'Mon', unread: true },
  ],
  sent: [{ id: 's1', from: 'To: Ssemwanga Ronald', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=75', subject: 'Re: Buganda design feedback', snippet: 'Love the cultural motif direction, ship it.', time: 'Tue', unread: false }],
  drafts: [{ id: 'd1', from: 'To: Kampala Tech Hub', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=75', subject: 'Meeting notes', snippet: 'Draft — untitled body text...', time: '', unread: false }],
  spam: [],
  trash: []
};

export const INITIAL_STORIES: Story[] = [
  {
    id: 1,
    userId: 'c0',
    name: 'Your Story',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=75',
    seen: false,
    mine: true,
    timeAgo: 'Just now',
    items: [
      {
        id: 'st-me-1',
        type: 'text',
        caption: 'Working on the new Kampala Tech App launch! 🚀',
        textOverlay: 'Oli Otya Kampala! 🇺🇬',
        bgColor: 'linear-gradient(135deg, #00A884, #005C4B)',
        textColor: '#ffffff',
        fontStyle: 'bold',
        createdAt: '10m ago',
        stickers: [
          { id: 's1', type: 'location', content: 'Kampala, Uganda 📍', x: 25, y: 70 },
          { id: 's2', type: 'timestamp', content: '10:45 AM 🕒', x: 70, y: 70 },
        ],
        music: {
          id: 'm1',
          title: 'Sitya Loss',
          artist: 'Eddy Kenzo',
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=75',
          layoutStyle: 'vinyl',
        },
        viewers: [
          { id: 'v1', name: 'Kato Mukasa', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=75', time: '5m ago' },
          { id: 'v2', name: 'Babirye Kintu', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=75', time: '8m ago' },
        ],
      }
    ]
  },
  {
    id: 2,
    userId: 'c1',
    name: 'Kato',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=75',
    seen: false,
    timeAgo: '25m ago',
    items: [
      {
        id: 'st-kato-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        caption: 'Morning sunrise over Lake Victoria ☀️',
        filter: 'pop',
        createdAt: '25m ago',
        stickers: [
          { id: 'sk1', type: 'location', content: 'Lake Victoria, Entebbe 📍', x: 50, y: 80 }
        ],
        music: {
          id: 'm2',
          title: 'Malaika',
          artist: 'Uganda Harmony Folk',
          layoutStyle: 'card',
        }
      }
    ]
  },
  {
    id: 3,
    userId: 'c2',
    name: 'Babirye',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=75',
    seen: false,
    timeAgo: '1h ago',
    items: [
      {
        id: 'st-bab-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        caption: 'Crafting custom Lubugo barkcloth designs today 🎨',
        createdAt: '1h ago',
        music: {
          id: 'm3',
          title: 'Buganda Royal Beats',
          artist: 'Kadongo Kamu Ensemble',
          layoutStyle: 'cassette',
        }
      }
    ]
  },
  {
    id: 4,
    userId: 'c3',
    name: 'Ssemwanga',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=75',
    seen: true,
    timeAgo: '3h ago',
    items: [
      {
        id: 'st-ssem-1',
        type: 'text',
        caption: 'Traditional Buganda architecture research session',
        textOverlay: 'Bulange Mengo 🏛️',
        bgColor: 'linear-gradient(135deg, #4A154B, #111A24)',
        textColor: '#FFD700',
        fontStyle: 'serif',
        createdAt: '3h ago'
      }
    ]
  },
  {
    id: 5,
    userId: 'c4',
    name: 'Namubiru',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=75',
    seen: true,
    timeAgo: '5h ago',
    items: [
      {
        id: 'st-nam-1',
        type: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        caption: 'Tech meetup at Mengo Innovation Center 💻',
        createdAt: '5h ago'
      }
    ]
  },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { from: 'them', type: 'text', text: 'Oli otya bro! Quick one before the team call.', time: '09:10' },
    { from: 'them', type: 'text', text: 'Can you send over the updated Kampala App tokens?', time: '09:11' },
    { from: 'me', type: 'text', text: 'On it — pulling the latest export now.', time: '09:20', status: 'read' },
    { from: 'me', type: 'doc', name: 'kampala-brand-tokens-v3.pdf', size: '2.1 MB', time: '09:24', status: 'read' },
    { from: 'them', type: 'sticker', emoji: '🎉', time: '09:25' },
    { from: 'them', type: 'voice', dur: '0:18', time: '09:31' },
    { from: 'me', type: 'text', text: 'Oli otya! Sent the files, check inbox', time: '09:41', status: 'delivered' },
  ],
  c2: [
    { from: 'them', type: 'voice', dur: '0:42', time: '08:12' },
    { from: 'me', type: 'text', text: 'Webale nnyo, transcribing this later 😄', time: '08:14', status: 'read' },
  ],
  c3: [
    { from: 'me', type: 'sketch', time: 'Yesterday', status: 'read' },
    { from: 'them', type: 'text', text: 'That sketch of the Buganda motif looks great!', time: 'Yesterday', reactions: ['❤️'] },
  ],
  c4: [
    { from: 'them', type: 'location', label: 'Live Location · Kampala Road', time: 'Yesterday' },
    { from: 'me', type: 'text', text: 'On my way to Mengo, 10 mins', time: 'Yesterday', status: 'read' },
  ],
  c5: [
    { from: 'them', type: 'poll', question: 'Pick the launch date for Kampala App', options: [['Sept 12', 62], ['Sept 19', 38]], time: 'Mon' },
  ],
  g1: [
    { from: 'them', name: 'Ssemwanga', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', type: 'text', text: 'Updated the tokens doc for Kampala Hub, ready for review.', time: '11:02' },
    { from: 'them', name: 'Nakyagaba Grace', avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=250&q=80', type: 'contact', cname: 'Kampala Tech Print Shop', cphone: '+256 701 555014', time: '11:05' },
  ],
  g2: [{ from: 'them', name: 'Ssemwanga', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', type: 'text', text: 'Meeting tomorrow at Bulange Mengo at 9:00 AM.', time: '07:40' }],
  g3: [{ from: 'them', name: 'Sekatte', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=250&q=80', type: 'text', text: 'Traditional customs handbook pinned above 📌', time: '10:00' }],
  ch1: [{ from: 'them', name: 'Uganda Tech News', avatar: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=250&q=80', type: 'text', text: 'New: Mobile money integrations rolling out across East Africa.', time: 'Today' }],
  ch2: [{ from: 'them', name: 'Buganda Heritage & Arts', avatar: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=250&q=80', type: 'text', text: 'On traditional Lubugo barkcloth weaving and design rhythm.', time: 'Today' }],
  ch3: [{ from: 'them', avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=250&q=80', type: 'doc', name: 'kampala-q3-roadmap.pdf', size: '640 KB', time: 'Today' }],
};

export const AUTO_REPLIES = [
  'Oli otya! Got it 👍',
  'Webale nnyo! Sounds good, talking soon.',
  'Ha, exactly! Mukwano.',
  'Let me check with the Kampala team and get back to you.',
  'Perfect, thank you! Kulika.'
];

export const WHATSAPP_THEMES: WhatsAppTheme[] = [
  // 1. Classic Emerald
  {
    "id": "emerald_light",
    "name": "Classic Emerald",
    "isDark": false,
    "primary": "#075E54",
    "primaryDark": "#128C7E",
    "accent": "#25D366",
    "background": "#E5DDD5",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#DCF8C6",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#111B21",
    "textSecondary": "#667781",
    "divider": "#E9EDEF"
  },
  {
    "id": "emerald_dark",
    "name": "Classic Emerald Dark",
    "isDark": true,
    "primary": "#121B22",
    "primaryDark": "#0B141A",
    "accent": "#00A884",
    "background": "#0B141A",
    "surface": "#111B21",
    "chatBubbleSent": "#005C4B",
    "chatBubbleReceived": "#202C33",
    "textPrimary": "#E9EDEF",
    "textSecondary": "#8696A0",
    "divider": "#222D34"
  },
  // 2. Slate Minimal
  {
    "id": "slate_light",
    "name": "Slate Light",
    "isDark": false,
    "primary": "#4A5568",
    "primaryDark": "#2D3748",
    "accent": "#319795",
    "background": "#F7FAFC",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#E6FFFA",
    "chatBubbleReceived": "#EDF2F7",
    "textPrimary": "#1A202C",
    "textSecondary": "#718096",
    "divider": "#E2E8F0"
  },
  {
    "id": "slate_dark",
    "name": "Slate Dark",
    "isDark": true,
    "primary": "#1F2C34",
    "primaryDark": "#121B22",
    "accent": "#00A884",
    "background": "#0B141A",
    "surface": "#111B21",
    "chatBubbleSent": "#005C4B",
    "chatBubbleReceived": "#202C33",
    "textPrimary": "#E9EDEF",
    "textSecondary": "#8696A0",
    "divider": "#222D34"
  },
  // 3. Midnight Obsidian
  {
    "id": "midnight_light",
    "name": "Midnight Frost",
    "isDark": false,
    "primary": "#2D3142",
    "primaryDark": "#1F222E",
    "accent": "#4F5D75",
    "background": "#F4F5F8",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#E2E8F0",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#101216",
    "textSecondary": "#6B7280",
    "divider": "#E5E7EB"
  },
  {
    "id": "midnight_dark",
    "name": "Midnight Obsidian",
    "isDark": true,
    "primary": "#000000",
    "primaryDark": "#000000",
    "accent": "#10B981",
    "background": "#000000",
    "surface": "#0A0A0A",
    "chatBubbleSent": "#064E3B",
    "chatBubbleReceived": "#161616",
    "textPrimary": "#F1F1F1",
    "textSecondary": "#7A7A7A",
    "divider": "#1A1A1A"
  },
  // 4. Royal Gold
  {
    "id": "gold_light",
    "name": "Royal Gold",
    "isDark": false,
    "primary": "#8C6D1F",
    "primaryDark": "#695115",
    "accent": "#D4AF37",
    "background": "#FAF7EF",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#FFF8DC",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#2A2312",
    "textSecondary": "#7A6D52",
    "divider": "#EFE8D6"
  },
  {
    "id": "gold_dark",
    "name": "Royal Gold Dark",
    "isDark": true,
    "primary": "#1A1D1A",
    "primaryDark": "#111411",
    "accent": "#D4AF37",
    "background": "#0E110E",
    "surface": "#161A16",
    "chatBubbleSent": "#2D2810",
    "chatBubbleReceived": "#1E241E",
    "textPrimary": "#F5E6C8",
    "textSecondary": "#A39678",
    "divider": "#2B302B"
  },
  // 5. Sky Blue
  {
    "id": "sky_blue_light",
    "name": "Sky Blue",
    "isDark": false,
    "primary": "#1D70B8",
    "primaryDark": "#144E82",
    "accent": "#0088CC",
    "background": "#EBF4FB",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#E1F5FE",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#0F172A",
    "textSecondary": "#64748B",
    "divider": "#E2E8F0"
  },
  {
    "id": "sky_blue_dark",
    "name": "Sky Blue Dark",
    "isDark": true,
    "primary": "#0F172A",
    "primaryDark": "#020617",
    "accent": "#38BDF8",
    "background": "#0B1222",
    "surface": "#1E293B",
    "chatBubbleSent": "#0369A1",
    "chatBubbleReceived": "#334155",
    "textPrimary": "#F8FAFC",
    "textSecondary": "#94A3B8",
    "divider": "#1E293B"
  },
  // 6. iOS Minimal
  {
    "id": "ios_light",
    "name": "iOS Clean White",
    "isDark": false,
    "primary": "#F6F6F6",
    "primaryDark": "#E5E5EA",
    "accent": "#007AFF",
    "background": "#F2F2F7",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#E1FFC7",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#000000",
    "textSecondary": "#8E8E93",
    "divider": "#C7C7CC"
  },
  {
    "id": "ios_dark",
    "name": "iOS Obsidian Dark",
    "isDark": true,
    "primary": "#1C1C1E",
    "primaryDark": "#000000",
    "accent": "#0A84FF",
    "background": "#000000",
    "surface": "#1C1C1E",
    "chatBubbleSent": "#0A3C2A",
    "chatBubbleReceived": "#2C2C2E",
    "textPrimary": "#FFFFFF",
    "textSecondary": "#8E8E93",
    "divider": "#38383A"
  },
  // 7. Cyberpunk Neon
  {
    "id": "cyberpunk_light",
    "name": "Cyberpunk Light",
    "isDark": false,
    "primary": "#00B894",
    "primaryDark": "#008A6F",
    "accent": "#00E676",
    "background": "#E8F8F5",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#D4F8E8",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#1A252C",
    "textSecondary": "#5B707A",
    "divider": "#D1E7DD"
  },
  {
    "id": "cyberpunk_dark",
    "name": "Cyberpunk Dark",
    "isDark": true,
    "primary": "#0D1117",
    "primaryDark": "#05080C",
    "accent": "#00FF66",
    "background": "#080B10",
    "surface": "#121824",
    "chatBubbleSent": "#003D1B",
    "chatBubbleReceived": "#1A2332",
    "textPrimary": "#E6F8FF",
    "textSecondary": "#68829E",
    "divider": "#1F293D"
  },
  // 8. Crimson Sunset
  {
    "id": "sunset_light",
    "name": "Crimson Sunset Light",
    "isDark": false,
    "primary": "#D63031",
    "primaryDark": "#AE2122",
    "accent": "#FF7675",
    "background": "#FFF5F5",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#FFE3E3",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#2D3436",
    "textSecondary": "#636E72",
    "divider": "#F1D1D1"
  },
  {
    "id": "sunset_dark",
    "name": "Crimson Sunset Dark",
    "isDark": true,
    "primary": "#2B1B1D",
    "primaryDark": "#1A1012",
    "accent": "#FF4757",
    "background": "#120C0D",
    "surface": "#1F1416",
    "chatBubbleSent": "#4A151B",
    "chatBubbleReceived": "#2B1E20",
    "textPrimary": "#FFEAEA",
    "textSecondary": "#A37E82",
    "divider": "#362427"
  },
  // 9. Pastel Lavender
  {
    "id": "pastel_light",
    "name": "Pastel Lavender",
    "isDark": false,
    "primary": "#6C5CE7",
    "primaryDark": "#5B4BC4",
    "accent": "#A29BFE",
    "background": "#FAF0F5",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#EAE6FF",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#2D3436",
    "textSecondary": "#7F8C8D",
    "divider": "#E8E3FA"
  },
  {
    "id": "pastel_dark",
    "name": "Pastel Dusk",
    "isDark": true,
    "primary": "#1E1A2B",
    "primaryDark": "#120F1C",
    "accent": "#A29BFE",
    "background": "#0F0C17",
    "surface": "#1A1526",
    "chatBubbleSent": "#392B5C",
    "chatBubbleReceived": "#251F36",
    "textPrimary": "#F3EFEF",
    "textSecondary": "#9A8EB3",
    "divider": "#2C2340"
  },
  // 10. Forest Pine
  {
    "id": "forest_light",
    "name": "Forest Pine Light",
    "isDark": false,
    "primary": "#1B4332",
    "primaryDark": "#081C15",
    "accent": "#40916C",
    "background": "#F0F7F4",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#D8F3DC",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#1B4332",
    "textSecondary": "#52796F",
    "divider": "#D8E2DC"
  },
  {
    "id": "forest_dark",
    "name": "Forest Pine Dark",
    "isDark": true,
    "primary": "#0F1E17",
    "primaryDark": "#0A140F",
    "accent": "#34D399",
    "background": "#070F0B",
    "surface": "#13261D",
    "chatBubbleSent": "#0D402B",
    "chatBubbleReceived": "#1B3327",
    "textPrimary": "#ECFDF5",
    "textSecondary": "#6EE7B7",
    "divider": "#1A3B2C"
  }
];

export const THEMES: ThemeOption[] = [
  { k: 'classic', label: 'Classic Day', c: ['#E9EEF2', '#7FD9A6', '#6FB8E8'] },
  { k: 'day', label: 'Day', c: ['#F3F5FA', '#4C8DFF', '#FFFFFF'] },
  { k: 'night', label: 'Night', c: ['#10141F', '#6FF5C6', '#161B29'] },
  { k: 'nightblue', label: 'Night Blue', c: ['#0F1830', '#6FF5C6', '#1C2A52'] },
  { k: 'amoled', label: 'AMOLED', c: ['#000000', '#6FF5C6', '#111111'] },
  ...WHATSAPP_THEMES.map((wt) => ({
    k: wt.id,
    label: wt.name,
    c: [wt.background, wt.accent, wt.surface] as [string, string, string],
  })),
];

export const ACCENTS = [
  '#6FF5C6,#4C8DFF',
  '#FF9A6F,#FF6F59',
  '#B388FF,#6FE0FF',
  '#FFD36F,#FF9A6F',
  '#7FD9A6,#6FB8E8'
];
