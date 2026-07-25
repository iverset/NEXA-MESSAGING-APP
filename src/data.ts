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
  { id: 'c1', name: 'Amara Osei', avatar: getPaletteGrad(0), online: true, unread: 2, pinned: true, muted: false, last: 'Sent the files, check inbox', time: '09:41' },
  { id: 'c2', name: 'Diego Ferreira', avatar: getPaletteGrad(1), online: false, unread: 0, pinned: false, muted: true, last: '🎤 Voice message', time: '08:12' },
  { id: 'c3', name: 'Priya Chandran', avatar: getPaletteGrad(2), online: true, unread: 0, pinned: false, muted: false, last: 'That sketch looks great!', time: 'Yesterday' },
  { id: 'c4', name: 'Noah Bergström', avatar: getPaletteGrad(3), online: false, unread: 5, pinned: false, muted: false, last: '📍 Live location shared', time: 'Yesterday' },
  { id: 'c5', name: 'Yuki Tanaka', avatar: getPaletteGrad(4), online: true, unread: 0, pinned: false, muted: false, last: 'Poll: pick the launch date', time: 'Mon' },
];

export const INITIAL_GROUPS: ChatRoom[] = [
  { id: 'g1', name: 'Design Guild', avatar: getPaletteGrad(5), members: 128, unread: 12, last: 'Priya: updated the tokens doc' },
  { id: 'g2', name: 'Weekend Hikers', avatar: getPaletteGrad(6), members: 34, unread: 0, last: 'Diego: 6am at the trailhead' },
  { id: 'g3', name: 'NEXA Beta Testers', avatar: getPaletteGrad(7), members: 812, unread: 3, last: 'Admin: v2.6 notes pinned' },
];

export const INITIAL_CHANNELS: ChatRoom[] = [
  { id: 'ch1', name: 'Product Updates', avatar: getPaletteGrad(2), type: 'Public', subs: '44.2k', last: 'New: scheduled messages rolling out' },
  { id: 'ch2', name: 'Design Notes', avatar: getPaletteGrad(4), type: 'Public', subs: '9.8k', last: 'On bubble radius and rhythm' },
  { id: 'ch3', name: 'Internal Roadmap', avatar: getPaletteGrad(6), type: 'Private', subs: '56', last: 'Q3 milestones attached' },
];

export const INITIAL_COMMUNITIES: ChatRoom[] = [
  { id: 'co1', name: 'NEXA Builders', avatar: getPaletteGrad(1), groups: 6, channels: 3, desc: 'Everything about building on the platform.', last: '' },
  { id: 'co2', name: 'City Creatives', avatar: getPaletteGrad(3), groups: 11, channels: 2, desc: 'Local artists, makers & meetups.', last: '' },
];

export const INITIAL_MAIL: Record<string, MailItem[]> = {
  inbox: [
    { id: 'm1', from: 'Amara Osei', subject: 'Q3 deck — final review', snippet: 'Left a couple comments on slide 4, otherwise ready to send.', time: '09:12', unread: true },
    { id: 'm2', from: 'NEXA Team', subject: 'Your weekly summary', snippet: 'You sent 214 messages and joined 2 new communities.', time: 'Yesterday', unread: false },
    { id: 'm3', from: 'Noah Bergström', subject: 'Invoice #2291', snippet: 'Attached is the invoice for last month.', time: 'Mon', unread: true },
  ],
  sent: [{ id: 's1', from: 'To: Priya Chandran', subject: 'Re: sketch feedback', snippet: 'Love the direction, ship it.', time: 'Tue', unread: false }],
  drafts: [{ id: 'd1', from: 'To: Design Guild', subject: 'Meeting notes', snippet: 'Draft — untitled body text...', time: '', unread: false }],
  spam: [],
  trash: []
};

export const INITIAL_STORIES: Story[] = [
  { id: 1, name: 'Your Story', avatar: getPaletteGrad(0), seen: false, mine: true },
  { id: 2, name: 'Amara', avatar: getPaletteGrad(0), seen: false },
  { id: 3, name: 'Diego', avatar: getPaletteGrad(1), seen: false },
  { id: 4, name: 'Priya', avatar: getPaletteGrad(2), seen: true },
  { id: 5, name: 'Noah', avatar: getPaletteGrad(3), seen: true },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { from: 'them', type: 'text', text: 'Morning! Quick one before the call.', time: '09:10' },
    { from: 'them', type: 'text', text: 'Can you send over the updated brand tokens?', time: '09:11' },
    { from: 'me', type: 'text', text: 'On it — pulling the latest export now.', time: '09:20', status: 'read' },
    { from: 'me', type: 'doc', name: 'brand-tokens-v3.pdf', size: '2.1 MB', time: '09:24', status: 'read' },
    { from: 'them', type: 'sticker', emoji: '🎉', time: '09:25' },
    { from: 'them', type: 'voice', dur: '0:18', time: '09:31' },
    { from: 'me', type: 'text', text: 'Sent the files, check inbox', time: '09:41', status: 'delivered' },
  ],
  c2: [
    { from: 'them', type: 'voice', dur: '0:42', time: '08:12' },
    { from: 'me', type: 'text', text: 'Nice, transcribing this later 😄', time: '08:14', status: 'read' },
  ],
  c3: [
    { from: 'me', type: 'sketch', time: 'Yesterday', status: 'read' },
    { from: 'them', type: 'text', text: 'That sketch looks great!', time: 'Yesterday', reactions: ['❤️'] },
  ],
  c4: [
    { from: 'them', type: 'location', label: 'Live Location · Central Park', time: 'Yesterday' },
    { from: 'me', type: 'text', text: 'On my way, 10 mins', time: 'Yesterday', status: 'read' },
  ],
  c5: [
    { from: 'them', type: 'poll', question: 'Pick the launch date', options: [['Sept 12', 62], ['Sept 19', 38]], time: 'Mon' },
  ],
  g1: [
    { from: 'them', name: 'Priya', avatar: getPaletteGrad(2), type: 'text', text: 'Updated the tokens doc, ready for review.', time: '11:02' },
    { from: 'them', name: 'Marco', avatar: getPaletteGrad(6), type: 'contact', cname: 'Studio Print Shop', cphone: '+1 555 0148', time: '11:05' },
  ],
  g2: [{ from: 'them', name: 'Diego', avatar: getPaletteGrad(1), type: 'text', text: '6am at the trailhead, bring layers.', time: '07:40' }],
  g3: [{ from: 'them', name: 'Admin', avatar: getPaletteGrad(7), type: 'text', text: 'v2.6 notes pinned above 📌', time: '10:00' }],
  ch1: [{ from: 'them', name: 'Product Updates', avatar: getPaletteGrad(2), type: 'text', text: 'New: scheduled messages rolling out to beta users this week.', time: 'Today' }],
  ch2: [{ from: 'them', name: 'Design Notes', avatar: getPaletteGrad(4), type: 'text', text: 'On bubble radius and rhythm — why 16px felt right here.', time: 'Today' }],
  ch3: [{ from: 'them', avatar: getPaletteGrad(6), type: 'doc', name: 'q3-roadmap.pdf', size: '640 KB', time: 'Today' }],
};

export const AUTO_REPLIES = [
  'Got it 👍',
  'Sounds good, talking soon.',
  'Ha, exactly.',
  'Let me check and get back to you.',
  'Perfect, thank you!'
];

export const WHATSAPP_THEMES: WhatsAppTheme[] = [
  {
    "id": "whatsapp_light",
    "name": "Authentic WhatsApp Green (Classic Light)",
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
    "id": "whatsapp_dark",
    "name": "WhatsApp Slate Dark (Classic Dark)",
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
  {
    "id": "midnight_amoled",
    "name": "Midnight Black (True AMOLED Dark)",
    "isDark": true,
    "primary": "#000000",
    "primaryDark": "#000000",
    "accent": "#25D366",
    "background": "#000000",
    "surface": "#0A0A0A",
    "chatBubbleSent": "#0D382C",
    "chatBubbleReceived": "#161616",
    "textPrimary": "#F1F1F1",
    "textSecondary": "#7A7A7A",
    "divider": "#1A1A1A"
  },
  {
    "id": "emerald_gold",
    "name": "Emerald Gold / WhatsGold",
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
  {
    "id": "telegram_sky_blue",
    "name": "Telegram Sky Blue",
    "isDark": false,
    "primary": "#2481CC",
    "primaryDark": "#1A639B",
    "accent": "#50A2E9",
    "background": "#82A7C9",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#EFF7FF",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#222222",
    "textSecondary": "#707983",
    "divider": "#E4ECF2"
  },
  {
    "id": "ios_crisp_white",
    "name": "iOS Crisp White / Frosted Gray",
    "isDark": false,
    "primary": "#F6F6F6",
    "primaryDark": "#E5E5EA",
    "accent": "#007AFF",
    "background": "#EFEFF4",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#E1FFC7",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#000000",
    "textSecondary": "#8E8E93",
    "divider": "#C7C7CC"
  },
  {
    "id": "cyberpunk_neon",
    "name": "Cyberpunk Neon Green & Dark Slate",
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
  {
    "id": "sunset_red_charcoal",
    "name": "Sunset Red & Charcoal",
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
  {
    "id": "soft_pastel_pink",
    "name": "Soft Pastel Pink & Lavender",
    "isDark": false,
    "primary": "#F8EDF3",
    "primaryDark": "#EFCBDC",
    "accent": "#E07A5F",
    "background": "#FAF0F5",
    "surface": "#FFFFFF",
    "chatBubbleSent": "#F3D8E6",
    "chatBubbleReceived": "#FFFFFF",
    "textPrimary": "#3D2B35",
    "textSecondary": "#8A6B7C",
    "divider": "#F0DCE6"
  },
  {
    "id": "deep_forest_green",
    "name": "Deep Forest Green",
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
