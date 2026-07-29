import React, { useState } from 'react';

export interface WallpaperOption {
  id: string;
  name: string;
  category: 'presets' | 'colors' | 'cultural' | 'custom';
  background: string;
  previewCss: string;
}

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  {
    id: 'whatsapp_dark_doodle',
    name: 'WhatsApp Dark Doodle',
    category: 'presets',
    background: 'radial-gradient(circle at 50% 50%, #0d1e28 0%, #0b141a 100%)',
    previewCss: 'radial-gradient(circle at 50% 50%, #0d1e28 0%, #0b141a 100%)',
  },
  {
    id: 'whatsapp_light_doodle',
    name: 'Classic Light Doodle',
    category: 'presets',
    background: 'linear-gradient(135deg, #efeae2 0%, #e1dcd3 100%)',
    previewCss: 'linear-gradient(135deg, #efeae2 0%, #e1dcd3 100%)',
  },
  {
    id: 'buganda_barkcloth',
    name: 'Buganda Barkcloth Warm',
    category: 'cultural',
    background: 'linear-gradient(135deg, #2b1810 0%, #170d08 100%)',
    previewCss: 'linear-gradient(135deg, #2b1810 0%, #170d08 100%)',
  },
  {
    id: 'kampala_sunset',
    name: 'Kampala Sunset Mesh',
    category: 'cultural',
    background: 'linear-gradient(135deg, #3a1c28 0%, #1c0e24 50%, #0a0814 100%)',
    previewCss: 'linear-gradient(135deg, #3a1c28 0%, #1c0e24 50%, #0a0814 100%)',
  },
  {
    id: 'nile_teal_pattern',
    name: 'River Nile Teal',
    category: 'cultural',
    background: 'linear-gradient(135deg, #0f2b2c 0%, #071518 100%)',
    previewCss: 'linear-gradient(135deg, #0f2b2c 0%, #071518 100%)',
  },
  {
    id: 'solid_dark_teal',
    name: 'Dark Teal',
    category: 'colors',
    background: '#0b141a',
    previewCss: '#0b141a',
  },
  {
    id: 'solid_deep_navy',
    name: 'Deep Navy',
    category: 'colors',
    background: '#0f172a',
    previewCss: '#0f172a',
  },
  {
    id: 'solid_crimson_dusk',
    name: 'Crimson Dusk',
    category: 'colors',
    background: '#210b11',
    previewCss: '#210b11',
  },
  {
    id: 'solid_vibrant_violet',
    name: 'Vibrant Violet',
    category: 'colors',
    background: '#171221',
    previewCss: '#171221',
  },
  {
    id: 'solid_pitch_black',
    name: 'Pitch Black',
    category: 'colors',
    background: '#000000',
    previewCss: '#000000',
  },
];

interface WallpaperPickerModalProps {
  roomName?: string;
  currentBg?: string;
  currentDim?: number;
  onApplyWallpaper: (background: string, dim: number, applyToAll: boolean) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const WallpaperPickerModal: React.FC<WallpaperPickerModalProps> = ({
  roomName,
  currentBg,
  currentDim = 20,
  onApplyWallpaper,
  onClose,
  onToast,
}) => {
  const [selectedBg, setSelectedBg] = useState<string>(currentBg || WALLPAPER_PRESETS[0].background);
  const [dimValue, setDimValue] = useState<number>(currentDim);
  const [applyToAll, setApplyToAll] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'cultural' | 'custom'>('presets');

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const formatted = `url('${customUrlInput.trim()}') center/cover no-repeat`;
    setSelectedBg(formatted);
    onToast('Custom image background loaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const formatted = `url('${evt.target.result}') center/cover no-repeat`;
          setSelectedBg(formatted);
          onToast('Custom wallpaper image uploaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '540px',
          maxWidth: '94vw',
          maxHeight: '90vh',
          background: 'var(--bg-1, #111b21)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-2, #202c33)',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              🖼️ Chat Wallpaper Picker
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              {roomName ? `Customizing wallpaper for "${roomName}"` : 'Customize general chat wallpaper'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Main Content Area: Preview + Controls */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Mockup Preview Box */}
          <div
            style={{
              height: '180px',
              borderRadius: '12px',
              background: selectedBg,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '16px',
              gap: '10px',
            }}
          >
            {/* Dim Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `#000000`,
                opacity: dimValue / 100,
                pointerEvents: 'none',
              }}
            />

            {/* Mock Message Sent */}
            <div
              style={{
                alignSelf: 'flex-end',
                background: 'var(--accent-1, #00A884)',
                color: '#111b21',
                padding: '8px 14px',
                borderRadius: '12px 12px 2px 12px',
                fontSize: '13px',
                fontWeight: 600,
                maxWidth: '75%',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              How does this wallpaper look? ✨
              <div style={{ fontSize: '10px', textAlign: 'right', opacity: 0.7, marginTop: '2px' }}>10:42 AM ✓✓</div>
            </div>

            {/* Mock Message Received */}
            <div
              style={{
                alignSelf: 'flex-start',
                background: 'var(--bg-2, #202c33)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '12px 12px 12px 2px',
                fontSize: '13px',
                maxWidth: '75%',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              It looks super crisp and authentic! 🔥
              <div style={{ fontSize: '10px', textAlign: 'right', opacity: 0.6, marginTop: '2px' }}>10:43 AM</div>
            </div>
          </div>

          {/* Wallpaper Dim Slider */}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Wallpaper Dimming Overlay</span>
              <span style={{ color: 'var(--accent-1, #00A884)' }}>{dimValue}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={dimValue}
              onChange={(e) => setDimValue(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-1, #00A884)', cursor: 'pointer' }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', gap: '8px' }}>
            {[
              { id: 'presets', label: 'Doodles' },
              { id: 'colors', label: 'Solid Colors' },
              { id: 'cultural', label: 'African Motifs' },
              { id: 'custom', label: 'Custom Image' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent-1, #00A884)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.7)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Grid */}
          {activeTab !== 'custom' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '12px',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {WALLPAPER_PRESETS.filter((p) => p.category === activeTab).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedBg(item.background)}
                  style={{
                    height: '80px',
                    borderRadius: '10px',
                    background: item.previewCss,
                    border: selectedBg === item.background ? '3px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transition: 'transform 0.15s ease',
                  }}
                  title={item.name}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: 'rgba(0,0,0,0.7)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#fff',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* File Upload */}
              <div>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: '6px' }}>
                  Upload photo from device:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* URL Input */}
              <form onSubmit={handleCustomUrlSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Paste image web URL..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--accent-1, #00A884)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Load URL
                </button>
              </form>
            </div>
          )}

          {/* Apply to all chats checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <input
              type="checkbox"
              id="applyAll"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              style={{ accentColor: 'var(--accent-1, #00A884)', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="applyAll" style={{ fontSize: '13px', cursor: 'pointer', color: 'rgba(255,255,255,0.9)' }}>
              Set as default wallpaper for <b>all chats</b>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: '14px 20px',
            background: 'var(--bg-2, #202c33)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyWallpaper(selectedBg, dimValue, applyToAll);
              onClose();
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: 'var(--accent-1, #00A884)',
              border: 'none',
              color: '#000',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,168,132,0.3)',
            }}
          >
            Set Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
};
