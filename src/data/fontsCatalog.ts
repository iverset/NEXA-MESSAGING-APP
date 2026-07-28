export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Calligraphy' | 'Casual' | 'Neon & Display' | 'Monospace' | 'UI Sans' | 'Serif & Gothic';
  isAsset?: boolean;
}

export const FONT_CATALOG: FontOption[] = [
  // 1. Calligraphy & Scripts (10)
  { id: 'lucida_calligraphy', name: 'Lucida Calligraphy', family: "'Lucida Calligraphy', 'Apple Chancery', cursive", category: 'Calligraphy', isAsset: true },
  { id: 'mv_boli', name: 'MV Boli', family: "'MV Boli', 'Comic Sans MS', cursive", category: 'Calligraphy', isAsset: true },
  { id: 'great_vibes', name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'Calligraphy' },
  { id: 'alex_brush', name: 'Alex Brush', family: "'Alex Brush', cursive", category: 'Calligraphy' },
  { id: 'pinyon_script', name: 'Pinyon Script', family: "'Pinyon Script', cursive", category: 'Calligraphy' },
  { id: 'tangerine', name: 'Tangerine', family: "'Tangerine', cursive", category: 'Calligraphy' },
  { id: 'allura', name: 'Allura', family: "'Allura', cursive", category: 'Calligraphy' },
  { id: 'monsieur_la_doulaise', name: 'Monsieur La Doulaise', family: "'Monsieur La Doulaise', cursive", category: 'Calligraphy' },
  { id: 'sacramento', name: 'Sacramento', family: "'Sacramento', cursive", category: 'Calligraphy' },
  { id: 'satisfy', name: 'Satisfy', family: "'Satisfy', cursive", category: 'Calligraphy' },

  // 2. Casual & Handwriting (8)
  { id: 'dancing_script', name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Casual' },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", category: 'Casual' },
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive", category: 'Casual' },
  { id: 'kalam', name: 'Kalam', family: "'Kalam', cursive", category: 'Casual' },
  { id: 'indie_flower', name: 'Indie Flower', family: "'Indie Flower', cursive", category: 'Casual' },
  { id: 'shadows_into_light', name: 'Shadows Into Light', family: "'Shadows Into Light', cursive", category: 'Casual' },
  { id: 'gochi_hand', name: 'Gochi Hand', family: "'Gochi Hand', cursive", category: 'Casual' },
  { id: 'patrick_hand', name: 'Patrick Hand', family: "'Patrick Hand', cursive", category: 'Casual' },

  // 3. Neon, Retro & Display (8)
  { id: 'lobster', name: 'Lobster', family: "'Lobster', display", category: 'Neon & Display' },
  { id: 'press_start_2p', name: 'Press Start 2P', family: "'Press Start 2P', monospace", category: 'Neon & Display' },
  { id: 'monoton', name: 'Monoton', family: "'Monoton', display", category: 'Neon & Display' },
  { id: 'audiowide', name: 'Audiowide', family: "'Audiowide', display", category: 'Neon & Display' },
  { id: 'berkshire_swash', name: 'Berkshire Swash', family: "'Berkshire Swash', display", category: 'Neon & Display' },
  { id: 'shrikhand', name: 'Shrikhand', family: "'Shrikhand', display", category: 'Neon & Display' },
  { id: 'permanent_marker', name: 'Permanent Marker', family: "'Permanent Marker', cursive", category: 'Neon & Display' },
  { id: 'creepster', name: 'Creepster', family: "'Creepster', display", category: 'Neon & Display' },

  // 4. Monospace (6)
  { id: 'fira_code', name: 'Fira Code', family: "'Fira Code', monospace", category: 'Monospace' },
  { id: 'roboto_mono', name: 'Roboto Mono', family: "'Roboto Mono', monospace", category: 'Monospace' },
  { id: 'jetbrains_mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'Monospace' },
  { id: 'space_mono', name: 'Space Mono', family: "'Space Mono', monospace", category: 'Monospace' },
  { id: 'courier_prime', name: 'Courier Prime', family: "'Courier Prime', monospace", category: 'Monospace' },
  { id: 'inconsolata', name: 'Inconsolata', family: "'Inconsolata', monospace", category: 'Monospace' },

  // 5. UI Sans-Serif (6)
  { id: 'inter', name: 'Inter (Default)', family: "'Inter', sans-serif", category: 'UI Sans' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'UI Sans' },
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", category: 'UI Sans' },
  { id: 'lexend', name: 'Lexend', family: "'Lexend', sans-serif", category: 'UI Sans' },
  { id: 'plus_jakarta_sans', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'UI Sans' },
  { id: 'urbanist', name: 'Urbanist', family: "'Urbanist', sans-serif", category: 'UI Sans' },

  // 6. Serif & Gothic (4)
  { id: 'playfair_display', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif & Gothic' },
  { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif", category: 'Serif & Gothic' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", category: 'Serif & Gothic' },
  { id: 'unifraktur_maguntia', name: 'UnifrakturMaguntia', family: "'UnifrakturMaguntia', cursive", category: 'Serif & Gothic' },
];

// Helper to dynamically load Google Font link stylesheet into head
export function loadGoogleFont(fontName: string) {
  if (!fontName || fontName.includes('Lucida Calligraphy') || fontName.includes('MV Boli') || fontName.includes('Inter')) {
    return;
  }

  const cleanName = fontName.replace(/['",]/g, '').trim();
  const fontSlug = cleanName.replace(/\s+/g, '+');
  const linkId = `google-font-${fontSlug.toLowerCase()}`;

  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}:ital,wght@0,400;0,600;0,700;1,400&display=swap`;
    document.head.appendChild(link);
  }
}

// Batch preload Google fonts for previews
export function preloadAllGoogleFonts() {
  const googleFontNames = [
    'Great Vibes', 'Alex Brush', 'Pinyon Script', 'Tangerine', 'Allura', 'Monsieur La Doulaise', 'Sacramento', 'Satisfy',
    'Dancing Script', 'Pacifico', 'Caveat', 'Kalam', 'Indie Flower', 'Shadows Into Light', 'Gochi Hand', 'Patrick Hand',
    'Lobster', 'Press Start 2P', 'Monoton', 'Audiowide', 'Berkshire Swash', 'Shrikhand', 'Permanent Marker', 'Creepster',
    'Fira Code', 'Roboto Mono', 'JetBrains Mono', 'Space Mono', 'Courier Prime', 'Inconsolata',
    'Poppins', 'Outfit', 'Lexend', 'Plus Jakarta Sans', 'Urbanist',
    'Playfair Display', 'Cinzel', 'Merriweather', 'UnifrakturMaguntia'
  ];

  const fontFamiliesParam = googleFontNames.map(f => `family=${f.replace(/\s+/g, '+')}`).join('&');
  const batchLinkId = 'google-fonts-catalog-batch';

  if (!document.getElementById(batchLinkId)) {
    const link = document.createElement('link');
    link.id = batchLinkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fontFamiliesParam}&display=swap`;
    document.head.appendChild(link);
  }
}
