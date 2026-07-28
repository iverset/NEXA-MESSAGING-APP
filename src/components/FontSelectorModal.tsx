import React, { useState, useEffect } from 'react';
import { FONT_CATALOG, FontOption, loadGoogleFont, preloadAllGoogleFonts } from '../data/fontsCatalog';

interface FontSelectorModalProps {
  isOpen: boolean;
  activeFontId: string;
  onSelectFont: (font: FontOption) => void;
  onClose: () => void;
}

export const FontSelectorModal: React.FC<FontSelectorModalProps> = ({
  isOpen,
  activeFontId,
  onSelectFont,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewText, setPreviewText] = useState('Sphinx of black quartz, judge my vow');

  useEffect(() => {
    if (isOpen) {
      preloadAllGoogleFonts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    'All',
    'UI Sans',
    'Calligraphy',
    'Casual',
    'Neon & Display',
    'Monospace',
    'Serif & Gothic',
  ];

  const filteredFonts = FONT_CATALOG.filter((f) => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          background: 'var(--bg-1, #111B21)',
          border: '1px solid var(--border, rgba(255,255,255,0.12))',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-0, #E9EDEF)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px', color: 'var(--accent-1, #00A884)' }}>🔤</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
                Change Font
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-1)', marginTop: '4px' }}>
              Select and organize your app typography. Changes apply instantly across all screens.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-0)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
            title="Close Font Selector"
          >
            ✕
          </button>
        </div>

        {/* Search & Custom Preview Input */}
        <div
          style={{
            padding: '16px 24px 12px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-1, #111B21)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search fonts by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: '12px',
                  border: '1px solid var(--border, rgba(255,255,255,0.14))',
                  background: 'var(--bg-2, rgba(255,255,255,0.05))',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  opacity: 0.5,
                  pointerEvents: 'none',
                }}
              >
                🔍
              </span>
            </div>

            {/* Live Sample Text Customizer */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Type custom sample text..."
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 34px',
                  borderRadius: '12px',
                  border: '1px solid var(--border, rgba(255,255,255,0.14))',
                  background: 'var(--bg-2, rgba(255,255,255,0.05))',
                  color: 'var(--text-0)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '13px',
                  opacity: 0.5,
                  pointerEvents: 'none',
                }}
              >
                ✍️
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: active
                      ? '1px solid var(--accent-1, #00A884)'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: active
                      ? 'var(--accent-1, #00A884)'
                      : 'rgba(255,255,255,0.04)',
                    color: active ? '#000' : 'var(--text-0)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font List Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 24px 24px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredFonts.map((font) => {
            const isSelected = activeFontId === font.id;
            loadGoogleFont(font.name);

            return (
              <div
                key={font.id}
                onClick={() => {
                  onSelectFont(font);
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: isSelected
                    ? 'rgba(0, 168, 132, 0.16)'
                    : 'var(--bg-2, rgba(255,255,255,0.04))',
                  border: isSelected
                    ? '2px solid var(--accent-1, #00A884)'
                    : '1px solid var(--border, rgba(255,255,255,0.08))',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 18px rgba(0, 168, 132, 0.22)' : 'none',
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isSelected ? 'var(--accent-1, #00A884)' : 'var(--text-0)',
                      }}
                    >
                      {font.name}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'var(--text-1)',
                        fontWeight: 500,
                      }}
                    >
                      {font.category}
                    </span>
                  </div>

                  {isSelected && (
                    <span
                      style={{
                        background: 'var(--accent-1, #00A884)',
                        color: '#000',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      Selected ✓
                    </span>
                  )}
                </div>

                {/* Font Live Preview Sample */}
                <div
                  style={{
                    fontFamily: font.family,
                    fontSize: '16px',
                    lineHeight: '1.4',
                    color: isSelected ? 'var(--accent-1, #00A884)' : 'var(--text-0)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '2px',
                  }}
                >
                  {previewText || font.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-1)', fontWeight: 500 }}>
            {filteredFonts.length} font style{filteredFonts.length === 1 ? '' : 's'} available
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 22px',
              borderRadius: '12px',
              background: 'var(--accent-1, #00A884)',
              color: '#000',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 168, 132, 0.3)',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

