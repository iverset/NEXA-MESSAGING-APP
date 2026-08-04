import React, { useState, useEffect, useMemo } from 'react';
import {
  EmojiItem,
  EmojiCategory,
  DEFAULT_EMOJI_CATEGORIES,
  loadMassiveUnicodeEmojiDataset,
} from '../data/unicodeEmojis';
import {
  StickerPack,
  INITIAL_STICKER_PACKS,
  fetchDynamicStickerPacks,
  ALL_STATIC_STICKERS,
} from '../data/animatedStickers';
import { LottiePlayer } from './LottiePlayer';
import { AnimatedStickerItem } from '../types';

export type { AnimatedStickerItem };

interface EmojiPickerProps {
  isOpen?: boolean;
  onClose: () => void;
  onSelectStandardEmoji?: (emojiChar: string) => void;
  onSendAnimatedSticker?: (sticker: AnimatedStickerItem) => void;
  onSelectEmoji?: (emojiChar: string) => void;
  onSelectSticker?: (sticker: AnimatedStickerItem) => void;
}

const SKIN_TONES = [
  { name: 'Default', modifier: '' },
  { name: 'Light', modifier: '🏻' },
  { name: 'Medium-Light', modifier: '🏼' },
  { name: 'Medium', modifier: '🏽' },
  { name: 'Medium-Dark', modifier: '🏾' },
  { name: 'Dark', modifier: '🏿' },
];

const LOCAL_STORAGE_RECENT_KEY = 'nexa_telegram_recent_emojis_v3';

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  isOpen = true,
  onClose,
  onSelectStandardEmoji,
  onSendAnimatedSticker,
  onSelectEmoji,
  onSelectSticker,
}) => {
  const [categories, setCategories] = useState<EmojiCategory[]>(DEFAULT_EMOJI_CATEGORIES);
  const [isLoadingMassiveData, setIsLoadingMassiveData] = useState<boolean>(true);

  // Sticker pack state
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>(INITIAL_STICKER_PACKS);
  const [isFetchingPacks, setIsFetchingPacks] = useState<boolean>(true);
  const [activePackId, setActivePackId] = useState<string>('all');

  const [activeTab, setActiveTab] = useState<'standard' | 'animated'>('animated');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');
  const [showSkinToneMenu, setShowSkinToneMenu] = useState<boolean>(false);
  const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; preview: string } | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(120);

  // Reset rendering chunk limit on tab, category, or search query changes
  useEffect(() => {
    setDisplayLimit(120);
  }, [activeCategoryId, activeTab, searchQuery]);

  // Async load Unicode emoji dataset AND Dynamic Lottie Sticker Pack manifests
  useEffect(() => {
    let isSubscribed = true;

    // Load massive emoji dataset
    loadMassiveUnicodeEmojiDataset().then((massiveSet) => {
      if (isSubscribed && massiveSet && massiveSet.length > 0) {
        setCategories(massiveSet);
        setIsLoadingMassiveData(false);
      }
    });

    // Fetch dynamic Lottie sticker pack manifests
    fetchDynamicStickerPacks().then((loadedPacks) => {
      if (isSubscribed) {
        setStickerPacks(loadedPacks);
        setIsFetchingPacks(false);
      }
    });

    // Load recent emojis from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentEmojis(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse recent emojis', e);
    }

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Save recent emoji on click
  const saveRecentEmoji = (emoji: EmojiItem) => {
    setRecentEmojis((prev) => {
      const filtered = prev.filter((item) => item.char !== emoji.char);
      const updated = [emoji, ...filtered].slice(0, 32);
      try {
        localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }
      return updated;
    });
  };

  const handleEmojiClick = (emoji: EmojiItem) => {
    const fullChar = emoji.char + selectedSkinTone;
    const fn = onSelectStandardEmoji || onSelectEmoji;
    if (fn) fn(fullChar);
    saveRecentEmoji(emoji);
  };

  // Search filter across all 3,000+ emojis
  const searchFilteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: EmojiItem[] = [];

    for (const cat of categories) {
      for (const emoji of cat.emojis) {
        if (
          emoji.name.toLowerCase().includes(q) ||
          emoji.char === q ||
          (emoji.keywords && emoji.keywords.some((k) => k.toLowerCase().includes(q)))
        ) {
          matches.push(emoji);
        }
      }
    }
    return matches;
  }, [categories, searchQuery]);

  // Combine all animated stickers across packs
  const allAnimatedStickers = useMemo(() => {
    const map = new Map<string, AnimatedStickerItem>();
    stickerPacks.forEach((p) => {
      p.stickers.forEach((s) => map.set(s.id, s));
    });
    return Array.from(map.values());
  }, [stickerPacks]);

  // Filter animated stickers by active pack and search query
  const filteredAnimatedStickers = useMemo(() => {
    let list: AnimatedStickerItem[] = [];

    if (activePackId === 'all') {
      list = allAnimatedStickers;
    } else {
      const targetPack = stickerPacks.find((p) => p.id === activePackId);
      list = targetPack ? targetPack.stickers : allAnimatedStickers;
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.previewEmoji.includes(q)
    );
  }, [allAnimatedStickers, stickerPacks, activePackId, searchQuery]);

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0];
  }, [categories, activeCategoryId]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '68px',
        right: '16px',
        width: '400px',
        maxHeight: '540px',
        height: '500px',
        background: 'rgba(18, 22, 31, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: 'var(--text-0, #fff)',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="emoji-picker-container"
    >
      {/* Header Bar: Search & Skin Tone Picker */}
      <div
        style={{
          padding: '10px 12px 8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live Search Input */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '10px',
                fontSize: '13px',
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder={
                activeTab === 'standard'
                  ? `Search emojis...`
                  : `Search stickers...`
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 30px 7px 32px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                color: 'var(--text-0, #fff)',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-1, #aaa)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 6px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Skin Tone Selector Toggle */}
          {activeTab === 'standard' && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSkinToneMenu((prev) => !prev)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '20px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-0)',
                }}
                title="Select Skin Tone"
              >
                <span>👋{selectedSkinTone}</span>
                <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
              </button>

              {/* Skin Tone Dropdown Menu */}
              {showSkinToneMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    right: 0,
                    background: 'rgba(24, 28, 38, 0.98)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    zIndex: 1200,
                  }}
                >
                  {SKIN_TONES.map((st) => (
                    <button
                      key={st.name}
                      onClick={() => {
                        setSelectedSkinTone(st.modifier);
                        setShowSkinToneMenu(false);
                      }}
                      style={{
                        background:
                          selectedSkinTone === st.modifier
                            ? 'rgba(0, 240, 255, 0.2)'
                            : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--text-0, #fff)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>👋{st.modifier}</span>
                      <span>{st.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Close Picker Button */}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-1, #aaa)',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
            }}
            title="Close Emoji Picker"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Category Icons Strip for Standard Emojis */}
      {activeTab === 'standard' && !searchQuery && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 8px',
            gap: '2px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {recentEmojis.length > 0 && (
            <button
              onClick={() => setActiveCategoryId('recent')}
              style={{
                background:
                  activeCategoryId === 'recent'
                    ? 'rgba(0, 240, 255, 0.2)'
                    : 'transparent',
                border: 'none',
                borderBottom:
                  activeCategoryId === 'recent'
                    ? '2px solid var(--accent-1, #00F0FF)'
                    : '2px solid transparent',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              title="Frequently Used"
            >
              🕒
            </button>
          )}

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              style={{
                flexShrink: 0,
                background:
                  activeCategoryId === cat.id
                    ? 'rgba(0, 240, 255, 0.2)'
                    : 'transparent',
                border: 'none',
                borderBottom:
                  activeCategoryId === cat.id
                    ? '2px solid var(--accent-1, #00F0FF)'
                    : '2px solid transparent',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Pack Category Pills Strip for Animated Stickers */}
      {activeTab === 'animated' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            gap: '6px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <button
            onClick={() => setActivePackId('all')}
            style={{
              flexShrink: 0,
              background:
                activePackId === 'all'
                  ? 'rgba(0, 240, 255, 0.22)'
                  : 'rgba(255,255,255,0.06)',
              border:
                activePackId === 'all'
                  ? '1px solid rgba(0, 240, 255, 0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '4px 10px',
              color: activePackId === 'all' ? 'var(--accent-1, #00F0FF)' : 'var(--text-1, #ccc)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            🔥 All Packs ({allAnimatedStickers.length})
          </button>

          {stickerPacks.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setActivePackId(pack.id)}
              style={{
                flexShrink: 0,
                background:
                  activePackId === pack.id
                    ? 'rgba(0, 240, 255, 0.22)'
                    : 'rgba(255,255,255,0.06)',
                border:
                  activePackId === pack.id
                    ? '1px solid rgba(0, 240, 255, 0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '4px 10px',
                color: activePackId === pack.id ? 'var(--accent-1, #00F0FF)' : 'var(--text-1, #ccc)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
            >
              <span>{pack.icon}</span>
              <span>{pack.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Grid Viewport */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {activeTab === 'standard' ? (
          <>
            {searchQuery ? (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-1, #aaa)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Search Results</span>
                  <span>{searchFilteredEmojis.length} found</span>
                </div>
                {searchFilteredEmojis.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '32px 16px',
                      color: 'var(--text-1)',
                      fontSize: '13px',
                    }}
                  >
                    No emojis found matching "{searchQuery}"
                  </div>
                ) : (
                  <div
                    className="emoji-grid-container"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(8, 1fr)',
                      gap: '4px',
                    }}
                  >
                    {searchFilteredEmojis.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEmojiClick(item)}
                        onMouseEnter={() =>
                          setHoveredItem({ name: item.name, preview: item.char + selectedSkinTone })
                        }
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '22px',
                          padding: '6px 0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.1s, background 0.15s',
                        }}
                        className="emoji-btn-item"
                        title={item.name}
                      >
                        {item.char + selectedSkinTone}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : activeCategoryId === 'recent' ? (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-1, #aaa)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  🕒 Frequently Used
                </div>
                <div
                  className="emoji-grid-container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '4px',
                  }}
                >
                  {recentEmojis.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(item)}
                      onMouseEnter={() =>
                        setHoveredItem({ name: item.name, preview: item.char + selectedSkinTone })
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '22px',
                        padding: '6px 0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s, background 0.15s',
                      }}
                      className="emoji-btn-item"
                      title={item.name}
                    >
                      {item.char + selectedSkinTone}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-1, #aaa)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{currentCategory.name}</span>
                  <span style={{ opacity: 0.6, fontSize: '10px' }}>
                    {currentCategory.emojis.length} items
                  </span>
                </div>
                <div
                  className="emoji-grid-container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '4px',
                  }}
                >
                  {currentCategory.emojis.slice(0, displayLimit).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(item)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '22px',
                        padding: '6px 0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s, background 0.15s',
                      }}
                      className="emoji-btn-item"
                      title={item.name}
                    >
                      {item.char + selectedSkinTone}
                    </button>
                  ))}
                </div>

                {currentCategory.emojis.length > displayLimit && (
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + 250)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '10px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--accent-1, #00F0FF)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    Load More Emojis (+{currentCategory.emojis.length - displayLimit} remaining)
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Animated Stickers Tab */
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-1, #aaa)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                Stickers ({filteredAnimatedStickers.length})
              </span>
            </div>

            {filteredAnimatedStickers.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  color: 'var(--text-1)',
                  fontSize: '13px',
                }}
              >
                No stickers matching "{searchQuery}"
              </div>
            ) : (
              <div
                className="sticker-grid-container"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                {filteredAnimatedStickers.map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => {
                      const fn = onSendAnimatedSticker || onSelectSticker;
                      if (fn) fn(stk);
                    }}
                    onMouseEnter={() =>
                      setHoveredItem({ name: stk.name, preview: stk.previewEmoji })
                    }
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '8px 4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.15s, background 0.15s',
                    }}
                    className="animated-sticker-card"
                  >
                    <div style={{ width: '60px', height: '60px', pointerEvents: 'none' }}>
                      <LottiePlayer
                        src={stk.lottieUrl}
                        fallbackSvg={stk.animatedSvg}
                        loop={true}
                        autoplay={true}
                        lazy={true}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        color: 'var(--text-0, #fff)',
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '75px',
                        opacity: 0.9,
                      }}
                    >
                      {stk.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover Info Tooltip Bar */}
      <div
        style={{
          minHeight: '28px',
          padding: '4px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-1, #aaa)',
        }}
      >
        {hoveredItem ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{hoveredItem.preview}</span>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--text-0, #fff)',
                textTransform: 'capitalize',
              }}
            >
              {hoveredItem.name}
            </span>
          </div>
        ) : (
          <span style={{ opacity: 0.7, fontSize: '11px' }}>
            {isFetchingPacks
              ? 'Syncing sticker packs...'
              : 'Hover to preview • Click to send'}
          </span>
        )}

        <span style={{ fontSize: '10px', opacity: 0.6 }}>
          {activeTab === 'animated' ? `${allAnimatedStickers.length} Items` : `${categories.reduce((acc, c) => acc + c.emojis.length, 0)} Items`}
        </span>
      </div>

      {/* Main Selector Tabs (Bottom Bar) */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.35)',
        }}
      >
        <button
          onClick={() => setActiveTab('animated')}
          style={{
            flex: 1,
            padding: '10px 0',
            background:
              activeTab === 'animated' ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            borderBottom:
              activeTab === 'animated'
                ? '2px solid var(--accent-1, #00F0FF)'
                : '2px solid transparent',
            color:
              activeTab === 'animated'
                ? 'var(--accent-1, #00F0FF)'
                : 'var(--text-1, #aaa)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'color 0.15s, background 0.15s',
          }}
          title="Stickers"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
            <path d="M14 3v6h6" />
            <circle cx="10" cy="13" r="2" />
          </svg>
          <span>Stickers</span>
        </button>

        <button
          onClick={() => setActiveTab('standard')}
          style={{
            flex: 1,
            padding: '10px 0',
            background:
              activeTab === 'standard' ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            borderBottom:
              activeTab === 'standard'
                ? '2px solid var(--accent-1, #00F0FF)'
                : '2px solid transparent',
            color:
              activeTab === 'standard'
                ? 'var(--accent-1, #00F0FF)'
                : 'var(--text-1, #aaa)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'color 0.15s, background 0.15s',
          }}
          title="Emojis"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <span>Emojis</span>
        </button>
      </div>
    </div>
  );
};
