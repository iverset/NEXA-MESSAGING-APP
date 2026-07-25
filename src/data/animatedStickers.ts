import { AnimatedStickerItem } from '../types';

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDynamic?: boolean;
  stickers: AnimatedStickerItem[];
}

// Helper to convert hex codepoint string (e.g., "1f602" or "1f468_200d_1f4bb") to unicode emoji string
export function hexToEmoji(hexStr: string): string {
  try {
    const parts = hexStr.split('_').map((h) => parseInt(h, 16));
    return String.fromCodePoint(...parts);
  } catch (e) {
    return '✨';
  }
}

// 1. REACTION PACK
const REACTION_STICKERS: AnimatedStickerItem[] = [
  {
    id: 'stk_laugh',
    name: 'Joy Laughing',
    category: 'Reactions',
    previewEmoji: '😂',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/lottie.json',
  },
  {
    id: 'stk_fire',
    name: 'Flame Blast',
    category: 'Reactions',
    previewEmoji: '🔥',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json',
  },
  {
    id: 'stk_heart_eyes',
    name: 'Love Eyes',
    category: 'Reactions',
    previewEmoji: '😍',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60d/lottie.json',
  },
  {
    id: 'stk_mind_blown',
    name: 'Mind Blown',
    category: 'Reactions',
    previewEmoji: '🤯',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/lottie.json',
  },
  {
    id: 'stk_party_face',
    name: 'Party Time',
    category: 'Reactions',
    previewEmoji: '🥳',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/lottie.json',
  },
  {
    id: 'stk_cool_glasses',
    name: 'Cyber Cool',
    category: 'Reactions',
    previewEmoji: '😎',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/lottie.json',
  },
  {
    id: 'stk_crying',
    name: 'Flood Tears',
    category: 'Reactions',
    previewEmoji: '😭',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/lottie.json',
  },
  {
    id: 'stk_shocked',
    name: 'Shocked Face',
    category: 'Reactions',
    previewEmoji: '😱',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f631/lottie.json',
  },
  {
    id: 'stk_thinking',
    name: 'Deep Thinker',
    category: 'Reactions',
    previewEmoji: '🤔',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/lottie.json',
  },
  {
    id: 'stk_angel',
    name: 'Holy Angel',
    category: 'Reactions',
    previewEmoji: '😇',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f607/lottie.json',
  },
  {
    id: 'stk_devil',
    name: 'Spicy Devil',
    category: 'Reactions',
    previewEmoji: '😈',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f608/lottie.json',
  },
  {
    id: 'stk_skull',
    name: 'Dead Skull',
    category: 'Reactions',
    previewEmoji: '💀',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f480/lottie.json',
  },
  {
    id: 'stk_ghost',
    name: 'Spooky Ghost',
    category: 'Reactions',
    previewEmoji: '👻',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f47b/lottie.json',
  },
  {
    id: 'stk_clapping',
    name: 'Bravo Clap',
    category: 'Reactions',
    previewEmoji: '👏',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/lottie.json',
  },
  {
    id: 'stk_thumbs_up',
    name: 'Super Like',
    category: 'Reactions',
    previewEmoji: '👍',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/lottie.json',
  },
  {
    id: 'stk_star_eyes',
    name: 'Star Struck',
    category: 'Reactions',
    previewEmoji: '🤩',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/lottie.json',
  },
  {
    id: 'stk_hugging',
    name: 'Warm Hug',
    category: 'Reactions',
    previewEmoji: '🤗',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f917/lottie.json',
  },
  {
    id: 'stk_angry',
    name: 'Rage Fire',
    category: 'Reactions',
    previewEmoji: '😡',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/lottie.json',
  },
  {
    id: 'stk_rofl',
    name: 'Rolling Laugh',
    category: 'Reactions',
    previewEmoji: '🤣',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f923/lottie.json',
  },
  {
    id: 'stk_wink',
    name: 'Playful Wink',
    category: 'Reactions',
    previewEmoji: '😜',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f61c/lottie.json',
  },
  {
    id: 'stk_kiss',
    name: 'Blow Kiss',
    category: 'Reactions',
    previewEmoji: '😘',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f618/lottie.json',
  },
  {
    id: 'stk_salute',
    name: 'Salute Captain',
    category: 'Reactions',
    previewEmoji: '🫡',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9e1/lottie.json',
  },
  {
    id: 'stk_melting',
    name: 'Melting Away',
    category: 'Reactions',
    previewEmoji: '🫠',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/lottie.json',
  },
  {
    id: 'stk_shushing',
    name: 'Secret Shh',
    category: 'Reactions',
    previewEmoji: '🤫',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92b/lottie.json',
  },
];

// 2. TELEGRAM DUCKS PACK
const TELEGRAM_DUCK_STICKERS: AnimatedStickerItem[] = [
  {
    id: 'duck_wave',
    name: 'Duck Hello',
    category: 'Telegram Ducks',
    previewEmoji: '🦆',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f986/lottie.json',
  },
  {
    id: 'duck_love',
    name: 'Duck Heart',
    category: 'Telegram Ducks',
    previewEmoji: '💖',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/lottie.json',
  },
  {
    id: 'duck_cool',
    name: 'Duck Boss',
    category: 'Telegram Ducks',
    previewEmoji: '🕶️',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f576_fe0f/lottie.json',
  },
  {
    id: 'duck_dance',
    name: 'Duck Disco',
    category: 'Telegram Ducks',
    previewEmoji: '🕺',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f57a/lottie.json',
  },
  {
    id: 'duck_sleep',
    name: 'Duck Sleeping',
    category: 'Telegram Ducks',
    previewEmoji: '😴',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f634/lottie.json',
  },
  {
    id: 'duck_chef',
    name: 'Duck Master Chef',
    category: 'Telegram Ducks',
    previewEmoji: '👨‍🍳',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f468_200d_1f373/lottie.json',
  },
];

// 3. ANIMALS & PETS PACK
const ANIMAL_STICKERS: AnimatedStickerItem[] = [
  {
    id: 'stk_dancing_cat',
    name: 'Dancing Kitty',
    category: 'Animals',
    previewEmoji: '🐱',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f431/lottie.json',
  },
  {
    id: 'stk_shiba_inu',
    name: 'Happy Doge',
    category: 'Animals',
    previewEmoji: '🐶',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f436/lottie.json',
  },
  {
    id: 'stk_fluffy_bunny',
    name: 'Bouncing Bunny',
    category: 'Animals',
    previewEmoji: '🐰',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f430/lottie.json',
  },
  {
    id: 'stk_cute_panda',
    name: 'Rolling Panda',
    category: 'Animals',
    previewEmoji: '🐼',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f43c/lottie.json',
  },
  {
    id: 'stk_rocket_penguin',
    name: 'Penguin Jet',
    category: 'Animals',
    previewEmoji: '🐧',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f427/lottie.json',
  },
  {
    id: 'stk_fox',
    name: 'Sly Fox',
    category: 'Animals',
    previewEmoji: '🦊',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f98a/lottie.json',
  },
  {
    id: 'stk_bear',
    name: 'Teddy Bear',
    category: 'Animals',
    previewEmoji: '🐻',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f43b/lottie.json',
  },
  {
    id: 'stk_koala',
    name: 'Sleepy Koala',
    category: 'Animals',
    previewEmoji: '🐨',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f428/lottie.json',
  },
  {
    id: 'stk_tiger',
    name: 'Roaring Tiger',
    category: 'Animals',
    previewEmoji: '🐯',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f42f/lottie.json',
  },
  {
    id: 'stk_frog',
    name: 'Joyful Frog',
    category: 'Animals',
    previewEmoji: '🐸',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f438/lottie.json',
  },
  {
    id: 'stk_unicorn',
    name: 'Magic Unicorn',
    category: 'Animals',
    previewEmoji: '🦄',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f984/lottie.json',
  },
  {
    id: 'stk_dragon',
    name: 'Mythic Dragon',
    category: 'Animals',
    previewEmoji: '🐉',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f409/lottie.json',
  },
];

// 4. HYPE & PARTY PACK
const PARTY_STICKERS: AnimatedStickerItem[] = [
  {
    id: 'stk_party_popper',
    name: 'Confetti Boom',
    category: 'Hype & Party',
    previewEmoji: '🎉',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/lottie.json',
  },
  {
    id: 'stk_winner_crown',
    name: 'Gold Crown',
    category: 'Hype & Party',
    previewEmoji: '👑',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f451/lottie.json',
  },
  {
    id: 'stk_champagne_pop',
    name: 'Champagne Pop',
    category: 'Hype & Party',
    previewEmoji: '🍾',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/lottie.json',
  },
  {
    id: 'stk_rocket_launch',
    name: 'Rocket Launch',
    category: 'Hype & Party',
    previewEmoji: '🚀',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/lottie.json',
  },
  {
    id: 'stk_electric_bolt',
    name: 'High Voltage',
    category: 'Hype & Party',
    previewEmoji: '⚡',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/26a1/lottie.json',
  },
  {
    id: 'stk_glowing_gem',
    name: 'Cyber Gem',
    category: 'Hype & Party',
    previewEmoji: '💎',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f48e/lottie.json',
  },
  {
    id: 'stk_hundred_points',
    name: '100% Legit',
    category: 'Hype & Party',
    previewEmoji: '💯',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/lottie.json',
  },
  {
    id: 'stk_sparkles',
    name: 'Magic Sparkles',
    category: 'Hype & Party',
    previewEmoji: '✨',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/2728/lottie.json',
  },
  {
    id: 'stk_fireworks',
    name: 'Grand Fireworks',
    category: 'Hype & Party',
    previewEmoji: '🎆',
    lottieUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f386/lottie.json',
  },
];

// 5. GOOGLE NOTO ANIMATED EMOJIS (Curated 100+ codepoints list)
const GOOGLE_NOTO_CODEPOINTS = [
  '1f600', '1f601', '1f602', '1f603', '1f604', '1f605', '1f606', '1f609', '1f60a', '1f60b',
  '1f60c', '1f60d', '1f60e', '1f60f', '1f618', '1f61a', '1f61c', '1f61d', '1f61e', '1f621',
  '1f622', '1f625', '1f628', '1f62a', '1f62d', '1f630', '1f631', '1f632', '1f633', '1f634',
  '1f637', '1f638', '1f639', '1f63a', '1f63b', '1f63c', '1f63d', '1f63e', '1f63f', '1f640',
  '1f642', '1f643', '1f644', '1f910', '1f911', '1f912', '1f913', '1f914', '1f915', '1f917',
  '1f920', '1f921', '1f922', '1f923', '1f924', '1f925', '1f927', '1f928', '1f929', '1f92a',
  '1f92b', '1f92c', '1f92d', '1f92e', '1f92f', '1f930', '1f970', '1f971', '1f973', '1f974',
  '1f975', '1f976', '1f97a', '1fae0', '1fae1', '1fae2', '1fae3', '1fae5', '1f44d', '1f44e',
  '1f44f', '1f450', '1f4a9', '1f4a1', '1f4a3', '1f4a4', '1f4a6', '1f4a8', '1f4af', '1f525',
  '1f52e', '1f528', '1f680', '1f984', '1f48e', '1f389', '1f38a', '1f386', '1f387', '1f388',
];

const GOOGLE_NOTO_STICKERS: AnimatedStickerItem[] = GOOGLE_NOTO_CODEPOINTS.map((hex, idx) => {
  const emojiStr = hexToEmoji(hex);
  return {
    id: `noto_${hex}_${idx}`,
    name: `Animated Emoji ${emojiStr}`,
    category: 'Google Animated Emojis',
    previewEmoji: emojiStr,
    lottieUrl: `https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/lottie.json`,
  };
});

export const ALL_STATIC_STICKERS: AnimatedStickerItem[] = [
  ...REACTION_STICKERS,
  ...TELEGRAM_DUCK_STICKERS,
  ...ANIMAL_STICKERS,
  ...PARTY_STICKERS,
  ...GOOGLE_NOTO_STICKERS,
];

export const INITIAL_STICKER_PACKS: StickerPack[] = [
  {
    id: 'pack_reactions',
    name: 'Animated Reactions',
    description: 'High-energy emotion reactions and expressions',
    icon: '🔥',
    stickers: REACTION_STICKERS,
  },
  {
    id: 'pack_google_noto',
    name: 'Google Animated Emojis',
    description: '100+ official Google Noto animated emoji pack',
    icon: '✨',
    stickers: GOOGLE_NOTO_STICKERS,
  },
  {
    id: 'pack_ducks',
    name: 'Telegram Ducks',
    description: 'Famous Telegram Duck mascot animated stickers',
    icon: '🦆',
    stickers: TELEGRAM_DUCK_STICKERS,
  },
  {
    id: 'pack_animals',
    name: 'Animals & Pets',
    description: 'Cute animated cats, dogs, pandas, and mythical creatures',
    icon: '🐼',
    stickers: ANIMAL_STICKERS,
  },
  {
    id: 'pack_party',
    name: 'Hype & Party',
    description: 'Confetti, crowns, rockets, and celebration animations',
    icon: '🎉',
    stickers: PARTY_STICKERS,
  },
];

// Open JSON manifest endpoints for dynamic fetching
const MANIFEST_ENDPOINTS = [
  {
    packId: 'pack_google_noto_dynamic',
    name: 'Google Noto Animated Emojis Manifest',
    url: 'https://raw.githubusercontent.com/googlefonts/noto-emoji-animation/main/emojis.json',
  },
];

export async function fetchDynamicStickerPacks(): Promise<StickerPack[]> {
  const packs: StickerPack[] = [...INITIAL_STICKER_PACKS];

  try {
    for (const endpoint of MANIFEST_ENDPOINTS) {
      const res = await fetch(endpoint.url);
      if (!res.ok) continue;

      const data = await res.json();
      const dynamicStickers: AnimatedStickerItem[] = [];

      // Parse array or object manifest format
      if (Array.isArray(data)) {
        data.slice(0, 150).forEach((item: any, i: number) => {
          const hex = typeof item === 'string' ? item : item.codepoint || item.hex;
          if (hex) {
            const char = hexToEmoji(hex);
            dynamicStickers.push({
              id: `dyn_${hex}_${i}`,
              name: item.name ? item.name : `Noto ${char}`,
              category: 'Google Animated Emojis',
              previewEmoji: char,
              lottieUrl: `https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/lottie.json`,
            });
          }
        });
      } else if (typeof data === 'object' && data !== null) {
        // Object format mapping categories or keys
        let idx = 0;
        Object.keys(data).forEach((key) => {
          const val = data[key];
          if (Array.isArray(val)) {
            val.forEach((hex: any) => {
              if (typeof hex === 'string') {
                const char = hexToEmoji(hex);
                dynamicStickers.push({
                  id: `dyn_obj_${hex}_${idx++}`,
                  name: `Noto ${key} ${char}`,
                  category: 'Google Animated Emojis',
                  previewEmoji: char,
                  lottieUrl: `https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/lottie.json`,
                });
              }
            });
          }
        });
      }

      if (dynamicStickers.length > 0) {
        // Merge fetched dynamic stickers into Google Animated Emojis pack
        const notoPackIndex = packs.findIndex((p) => p.id === 'pack_google_noto');
        if (notoPackIndex !== -1) {
          const existingIds = new Set(packs[notoPackIndex].stickers.map((s) => s.previewEmoji));
          const newUnique = dynamicStickers.filter((s) => !existingIds.has(s.previewEmoji));
          packs[notoPackIndex].stickers = [...packs[notoPackIndex].stickers, ...newUnique];
        }
      }
    }
  } catch (e) {
    console.warn('Failed to fetch dynamic sticker pack manifests, using fallback pack set', e);
  }

  return packs;
}

export const ANIMATED_TELEGRAM_STICKERS = ALL_STATIC_STICKERS;
