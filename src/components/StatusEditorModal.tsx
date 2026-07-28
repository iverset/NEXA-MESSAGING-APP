import React, { useState, useRef } from 'react';
import { StatusItem, StatusMusicTrack, StatusSticker } from '../types';
import { STATUS_MUSIC_LIBRARY } from '../data/statusMusic';

interface StatusEditorModalProps {
  userAvatarUrl?: string;
  userName?: string;
  onClose: () => void;
  onPostStatus: (newItem: StatusItem) => void;
}

const BG_PRESETS = [
  'linear-gradient(135deg, #00A884, #005C4B)',
  'linear-gradient(135deg, #6B11B0, #2C084B)',
  'linear-gradient(135deg, #FF5A36, #C71585)',
  'linear-gradient(135deg, #111A24, #0B1015)',
  'linear-gradient(135deg, #0088CC, #005580)',
  'linear-gradient(135deg, #E65100, #F57C00)',
];

const FONTS = [
  { id: 'sans', label: 'Sans', family: 'system-ui, -apple-system, sans-serif' },
  { id: 'serif', label: 'Serif', family: 'Georgia, serif' },
  { id: 'handwritten', label: 'Cursive', family: "'Caveat', 'Comic Sans MS', cursive" },
  { id: 'bold', label: 'Display', family: "'Impact', 'Trebuchet MS', sans-serif" },
  { id: 'monospace', label: 'Mono', family: "'Courier New', monospace" },
];

const STICKER_PRESETS = [
  { id: 'loc-1', type: 'location' as const, content: 'Kampala, Uganda 📍' },
  { id: 'loc-2', type: 'location' as const, content: 'Mengo Palace 📍' },
  { id: 'time-1', type: 'timestamp' as const, content: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' 🕒' },
  { id: 'em-1', type: 'emoji' as const, content: '🇺🇬' },
  { id: 'em-2', type: 'emoji' as const, content: '🔥' },
  { id: 'em-3', type: 'emoji' as const, content: '👑' },
  { id: 'em-4', type: 'emoji' as const, content: '🎉' },
];

const SAMPLE_MEDIA = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
];

export const StatusEditorModal: React.FC<StatusEditorModalProps> = ({
  onClose,
  onPostStatus,
}) => {
  const [mode, setMode] = useState<'text' | 'media'>('text');
  const [textOverlay, setTextOverlay] = useState('');
  const [fontIndex, setFontIndex] = useState(0);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [bgColorIndex, setBgColorIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState(SAMPLE_MEDIA[0]);
  const [filter, setFilter] = useState<'none' | 'pop' | 'bw' | 'cool' | 'warm'>('none');
  const [isMuted, setIsMuted] = useState(false);
  const [privacy, setPrivacy] = useState<'contacts' | 'contacts_except' | 'only_share'>('contacts');

  // Music state
  const [selectedMusic, setSelectedMusic] = useState<StatusMusicTrack | null>(null);
  const [musicSnippetStart, setMusicSnippetStart] = useState(0);
  const [musicLayoutStyle, setMusicLayoutStyle] = useState<'vinyl' | 'cassette' | 'card' | 'lyrics'>('vinyl');
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [musicSearch, setMusicSearch] = useState('');

  // Sticker & Doodle state
  const [stickers, setStickers] = useState<StatusSticker[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isDoodling, setIsDoodling] = useState(false);
  const [doodleColor, setDoodleColor] = useState('#FFD700');
  const [doodles, setDoodles] = useState<{ points: { x: number; y: number }[]; color: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentFont = FONTS[fontIndex % FONTS.length];
  const currentBg = BG_PRESETS[bgColorIndex % BG_PRESETS.length];

  const handleCycleFont = () => {
    setFontIndex((prev) => prev + 1);
  };

  const handleCycleBg = () => {
    setBgColorIndex((prev) => prev + 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedMediaUrl(url);
      setMode('media');
    }
  };

  const handleAddSticker = (preset: typeof STICKER_PRESETS[0]) => {
    const newSticker: StatusSticker = {
      id: 'stk-' + Date.now(),
      type: preset.type,
      content: preset.content,
      x: 35 + Math.random() * 20,
      y: 40 + Math.random() * 20,
    };
    setStickers((prev) => [...prev, newSticker]);
    setShowStickerPicker(false);
  };

  const handlePost = () => {
    const musicTrack = selectedMusic
      ? {
          ...selectedMusic,
          startTime: musicSnippetStart,
          layoutStyle: musicLayoutStyle,
        }
      : undefined;

    const newItem: StatusItem = {
      id: 'st-' + Date.now(),
      type: mode === 'text' ? 'text' : 'image',
      mediaUrl: mode === 'media' ? selectedMediaUrl : undefined,
      caption: caption || undefined,
      textOverlay: textOverlay || undefined,
      textColor: textColor,
      bgColor: mode === 'text' ? currentBg : undefined,
      fontStyle: currentFont.id as any,
      filter: filter,
      isMuted: isMuted,
      stickers: stickers,
      music: musicTrack,
      privacy: privacy,
      createdAt: 'Just now',
      viewers: [],
    };

    onPostStatus(newItem);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#090E11',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Font Cycle Button */}
          <button
            onClick={handleCycleFont}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title={`Font: ${currentFont.label}`}
          >
            T ({currentFont.label})
          </button>

          {/* Color/Bg Cycle Button */}
          {mode === 'text' ? (
            <button
              onClick={handleCycleBg}
              style={{
                background: currentBg,
                border: '2px solid #fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
              title="Change Background Gradient"
            />
          ) : (
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Text Color"
            />
          )}

          {/* Stickers Button */}
          <button
            onClick={() => setShowStickerPicker(true)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              fontSize: '18px',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
            }}
            title="Add Sticker or Location"
          >
            😊
          </button>

          {/* Music Button */}
          <button
            onClick={() => setShowMusicPicker(true)}
            style={{
              background: selectedMusic ? '#00A884' : 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              fontSize: '18px',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
            }}
            title="Add Music Track"
          >
            🎵
          </button>

          {/* Mute Toggle if Media */}
          {mode === 'media' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: isMuted ? '#FF3B30' : 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
              }}
              title={isMuted ? 'Muted' : 'Unmuted'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Canvas View */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: mode === 'text' ? currentBg : '#000',
          transition: 'background 0.3s ease',
        }}
      >
        {/* If Media mode */}
        {mode === 'media' && selectedMediaUrl && (
          <img
            src={selectedMediaUrl}
            alt="Status preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter:
                filter === 'pop'
                  ? 'saturate(1.8) contrast(1.1)'
                  : filter === 'bw'
                  ? 'grayscale(1)'
                  : filter === 'cool'
                  ? 'hue-rotate(30deg)'
                  : filter === 'warm'
                  ? 'sepia(0.4) saturate(1.4)'
                  : 'none',
            }}
          />
        )}

        {/* Text Overlay Input / Display */}
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            padding: '20px',
            textAlign: 'center',
            width: '80%',
            maxWidth: '500px',
          }}
        >
          <textarea
            value={textOverlay}
            onChange={(e) => setTextOverlay(e.target.value)}
            placeholder={mode === 'text' ? 'Type a status...' : 'Tap to add text overlay...'}
            rows={mode === 'text' ? 4 : 2}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: textColor,
              fontFamily: currentFont.family,
              fontSize: mode === 'text' ? '28px' : '22px',
              fontWeight: 'bold',
              textAlign: 'center',
              resize: 'none',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          />
        </div>

        {/* Placed Stickers Layer */}
        {stickers.map((stk) => (
          <div
            key={stk.id}
            style={{
              position: 'absolute',
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              background: 'rgba(0,0,0,0.65)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              cursor: 'move',
            }}
          >
            {stk.content}
            <span
              onClick={() => setStickers((prev) => prev.filter((s) => s.id !== stk.id))}
              style={{ marginLeft: '8px', opacity: 0.7, cursor: 'pointer' }}
            >
              ✕
            </span>
          </div>
        ))}

        {/* Music Sticker Overlay Badge */}
        {selectedMusic && (
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '20px',
              zIndex: 20,
              background: 'rgba(17, 27, 33, 0.85)',
              border: '1px solid var(--accent-1, #00A884)',
              borderRadius: musicLayoutStyle === 'vinyl' ? '50px' : '16px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {musicLayoutStyle === 'vinyl' ? (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #333 40%, #111 100%)',
                  border: '2px solid #00A884',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 4s linear infinite',
                }}
              >
                <div style={{ width: '8px', height: '8px', background: '#00A884', borderRadius: '50%' }} />
              </div>
            ) : (
              <span style={{ fontSize: '20px' }}>🎵</span>
            )}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {selectedMusic.title}
              </div>
              <div style={{ fontSize: '11px', color: '#00A884' }}>{selectedMusic.artist}</div>
            </div>
            <button
              onClick={() => setSelectedMusic(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
          background: 'rgba(17, 27, 33, 0.95)',
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Caption Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 16px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          {/* Media Pickers */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#fff',
            }}
            title="Choose from Gallery / Camera"
          >
            🖼️
          </button>
        </div>

        {/* Filter and Mode selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Filters selection if media mode */}
          {mode === 'media' ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['none', 'pop', 'bw', 'cool', 'warm'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? '#00A884' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          ) : (
            /* Mode switcher */
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMode('text')}
                style={{
                  background: mode === 'text' ? '#00A884' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Text
              </button>
              <button
                onClick={() => setMode('media')}
                style={{
                  background: mode === 'media' ? '#00A884' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Photo / Video
              </button>
            </div>
          )}

          {/* Privacy Dropdown & Send Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={privacy}
              onChange={(e: any) => setPrivacy(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '6px 10px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <option value="contacts" style={{ background: '#111b21' }}>
                My Contacts
              </option>
              <option value="contacts_except" style={{ background: '#111b21' }}>
                My Contacts Except...
              </option>
              <option value="only_share" style={{ background: '#111b21' }}>
                Only Share With...
              </option>
            </select>

            <button
              onClick={handlePost}
              style={{
                background: '#00A884',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,168,132,0.4)',
              }}
              title="Post Status Update"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Music Picker Modal Overlay */}
      {showMusicPicker && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10000,
            background: '#111B21',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Choose Background Track</span>
            <button
              onClick={() => setShowMusicPicker(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            value={musicSearch}
            onChange={(e) => setMusicSearch(e.target.value)}
            placeholder="Search songs, artists or genres..."
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 16px',
              color: '#fff',
              fontSize: '14px',
              marginBottom: '16px',
              outline: 'none',
            }}
          />

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {STATUS_MUSIC_LIBRARY.filter(
              (m) =>
                m.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
                m.artist.toLowerCase().includes(musicSearch.toLowerCase())
            ).map((tr) => (
              <div
                key={tr.id}
                onClick={() => {
                  setSelectedMusic(tr);
                  setShowMusicPicker(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={tr.coverUrl}
                  alt={tr.title}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{tr.title}</div>
                  <div style={{ fontSize: '12px', color: '#00A884' }}>{tr.artist}</div>
                </div>
                <button
                  style={{
                    background: '#00A884',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticker Picker Overlay */}
      {showStickerPicker && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(17, 27, 33, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Add Stickers & Tags</span>
            <button
              onClick={() => setShowStickerPicker(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {STICKER_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleAddSticker(preset)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  padding: '14px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {preset.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
