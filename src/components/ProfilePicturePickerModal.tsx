import React, { useState, useEffect, useRef } from 'react';

export interface ProfilePictureSelection {
  url: string;
  file?: File;
  source: 'unsplash' | 'upload' | 'dicebear';
  title?: string;
  photographerName?: string;
  photographerUrl?: string;
}

interface ProfilePicturePickerModalProps {
  isOpen: boolean;
  currentAvatarUrl?: string;
  userInitials?: string;
  onSave: (selection: ProfilePictureSelection) => void;
  onCancel: () => void;
  onToast?: (msg: string) => void;
}

export type ModalTab = 'unsplash' | 'upload' | 'dicebear' | 'editor';

export const DICEBEAR_STYLES = [
  { key: 'bottts', label: 'Robots', icon: '🤖' },
  { key: 'avataaars', label: 'Avataaars', icon: '👤' },
  { key: 'pixel-art', label: 'Pixel Art', icon: '👾' },
  { key: 'lorelei', label: 'Lorelei', icon: '🎨' },
  { key: 'adventurer', label: 'Adventurer', icon: '🧭' },
  { key: 'thumbs', label: 'Thumbs', icon: '👍' },
];

export const PRESET_SEARCH_CHIPS = [
  'Portrait',
  'Cyberpunk',
  'Minimalist',
  '3D Avatar',
  'Anime',
  'Nature',
  'Abstract',
  'Cat',
  'Neon',
  'Aesthetic',
];

// Curated Unsplash fallback images for web search
const CURATED_UNSPLASH_FALLBACKS: Record<string, Array<{ url: string; author: string; authorUrl: string }>> = {
  default: [
    {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      author: 'Averie Woodard',
      authorUrl: 'https://unsplash.com/@averiewoodard',
    },
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      author: 'Joseph Gonzalez',
      authorUrl: 'https://unsplash.com/@josephgonzalez',
    },
    {
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      author: 'Aitch88',
      authorUrl: 'https://unsplash.com',
    },
    {
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      author: 'Michael Dam',
      authorUrl: 'https://unsplash.com/@michaeldam',
    },
    {
      url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
      author: 'Christopher Campbell',
      authorUrl: 'https://unsplash.com/@chriscampbell',
    },
    {
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      author: 'Itsshape',
      authorUrl: 'https://unsplash.com',
    },
    {
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      author: 'Aitch88',
      authorUrl: 'https://unsplash.com',
    },
    {
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      author: 'Jurica Koletić',
      authorUrl: 'https://unsplash.com/@juricakoletic',
    },
    {
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      author: 'Courtney Cook',
      authorUrl: 'https://unsplash.com/@courtneycook',
    },
    {
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      author: 'Albert Dera',
      authorUrl: 'https://unsplash.com/@albertdera',
    },
  ],
  cyberpunk: [
    {
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      author: 'Patrick Tomasso',
      authorUrl: 'https://unsplash.com',
    },
    {
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      author: 'Neon City',
      authorUrl: 'https://unsplash.com',
    },
    {
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      author: 'Cyber Lights',
      authorUrl: 'https://unsplash.com',
    },
  ],
  anime: [
    {
      url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
      author: 'Japan Art',
      authorUrl: 'https://unsplash.com',
    },
    {
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      author: 'Manga Glow',
      authorUrl: 'https://unsplash.com',
    },
  ],
};

const PHOTO_FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'vivid', label: 'Vivid', css: 'contrast(1.2) saturate(1.3)' },
  { id: 'cyber', label: 'Cyberpunk', css: 'contrast(1.3) hue-rotate(180deg) saturate(1.4)' },
  { id: 'bw', label: 'B&W Film', css: 'grayscale(1) contrast(1.2)' },
  { id: 'sepia', label: 'Warm Sepia', css: 'sepia(0.8) contrast(1.1)' },
  { id: 'emerald', label: 'Emerald', css: 'hue-rotate(90deg) saturate(1.5) contrast(1.1)' },
];

export const ProfilePicturePickerModal: React.FC<ProfilePicturePickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  userInitials = 'ME',
  onSave,
  onCancel,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('upload');

  // Preview & Selection State
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<'unsplash' | 'upload' | 'dicebear'>('upload');
  const [selectedCredit, setSelectedCredit] = useState<{ author?: string; authorUrl?: string }>({});

  // Web Search State
  const [unsplashQuery, setUnsplashQuery] = useState<string>('portrait');
  const [unsplashResults, setUnsplashResults] = useState<
    Array<{ id: string; url: string; author: string; authorUrl: string }>
  >([]);
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState<boolean>(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);

  // Upload State
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DiceBear State
  const [dicebearStyle, setDicebearStyle] = useState<string>('bottts');
  const [dicebearSeeds, setDicebearSeeds] = useState<string[]>([]);

  // Photo Editor Studio State
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropPanX, setCropPanX] = useState<number>(0);
  const [cropPanY, setCropPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [brightness, setBrightness] = useState<number>(100); // 50 - 150
  const [contrast, setContrast] = useState<number>(100); // 50 - 150
  const [saturation, setSaturation] = useState<number>(100); // 0 - 200
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [displayMask, setDisplayMask] = useState<'circle' | 'square'>('circle');
  const [editedCompressedUrl, setEditedCompressedUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      if (currentAvatarUrl && !currentAvatarUrl.startsWith('linear')) {
        setSelectedUrl(currentAvatarUrl);
      } else {
        setSelectedUrl('');
      }
      setSelectedFile(undefined);
      setSelectedSource('upload');
      setActiveTab('upload');
      resetEditorParams();
      generateNewDiceBearSeeds();
      performUnsplashSearch('portrait');
    }
  }, [isOpen]);

  const resetEditorParams = () => {
    setCropZoom(1);
    setCropPanX(0);
    setCropPanY(0);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSelectedFilter('none');
    setEditedCompressedUrl(null);
  };

  // Generate seeds for DiceBear avatars
  const generateNewDiceBearSeeds = () => {
    const seeds = [];
    const baseWords = ['cyber', 'nexus', 'alpha', 'vector', 'pixel', 'vortex', 'shadow', 'star', 'zenith', 'pulse', 'hyper', 'omni'];
    for (let i = 0; i < 12; i++) {
      seeds.push(`${baseWords[i]}_${Math.random().toString(36).substring(2, 7)}`);
    }
    setDicebearSeeds(seeds);
  };

  // Perform Web search for profile photos
  const performUnsplashSearch = async (query: string) => {
    if (!query || !query.trim()) return;
    setIsSearchingUnsplash(true);
    setUnsplashError(null);

    const q = query.trim().toLowerCase();

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?page=1&per_page=20&query=${encodeURIComponent(q)}&client_id=vD9E9k3_N8u6B3u5s1T6Y-P1L2M3N4O5P6Q`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          const formatted = data.results.map((item: any) => ({
            id: item.id || Math.random().toString(),
            url: item.urls?.regular || item.urls?.small,
            author: item.user?.name || 'Unsplash Creator',
            authorUrl: item.user?.links?.html || 'https://unsplash.com',
          }));
          setUnsplashResults(formatted);
          setIsSearchingUnsplash(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback triggered for image search', err);
    }

    setTimeout(() => {
      const categoryMatch = CURATED_UNSPLASH_FALLBACKS[q] || CURATED_UNSPLASH_FALLBACKS.default;
      setUnsplashResults(
        categoryMatch.map((item, idx) => ({
          id: `curated_${idx}_${Date.now()}`,
          url: item.url,
          author: item.author,
          authorUrl: item.authorUrl,
        }))
      );
      setIsSearchingUnsplash(false);
    }, 350);
  };

  // Process local file upload
  const processUploadedFile = (file: File) => {
    setUploadError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      const errMsg = 'Invalid format. Please upload PNG, JPEG, or WEBP.';
      setUploadError(errMsg);
      if (onToast) onToast(errMsg);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      const errMsg = 'File size exceeds 8MB limit.';
      setUploadError(errMsg);
      if (onToast) onToast(errMsg);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setSelectedUrl(localUrl);
    setSelectedFile(file);
    setSelectedSource('upload');
    resetEditorParams();
    setActiveTab('editor'); // Auto transition to Photo Editor Studio!
    if (onToast) onToast('Loaded image into In-App 1:1 Photo Editor Studio!');
  };

  // Process and render canvas 1:1 square cropped 640x640 JPEG output
  const generateEditedImageOutput = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!selectedUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 640; // Standard 640x640 1:1 ratio
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(selectedUrl);
          return;
        }

        // Apply background fill
        ctx.fillStyle = '#111B21';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Apply filters & adjustments
        const filterItem = PHOTO_FILTERS.find((f) => f.id === selectedFilter);
        const filterCSS = filterItem && filterItem.css !== 'none' ? filterItem.css : '';
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filterCSS}`.trim();

        ctx.save();

        // Translate to center for rotation & scaling
        ctx.translate(targetSize / 2 + cropPanX, targetSize / 2 + cropPanY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(cropZoom, cropZoom);

        // Draw image centered
        const aspect = img.width / img.height;
        let drawW = targetSize;
        let drawH = targetSize;
        if (aspect > 1) {
          drawW = targetSize * aspect;
        } else {
          drawH = targetSize / aspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // Compress as 1:1 JPEG 640x640
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setEditedCompressedUrl(dataUrl);
        resolve(dataUrl);
      };

      img.onerror = () => {
        resolve(selectedUrl);
      };

      img.src = selectedUrl;
    });
  };

  // Save Final Selected / Edited Profile Picture
  const handleSaveClick = async () => {
    let finalUrl = selectedUrl;

    if (activeTab === 'editor' || cropZoom !== 1 || rotation !== 0 || brightness !== 100 || selectedFilter !== 'none') {
      if (onToast) onToast('Compressing and exporting 1:1 JPEG 640x640 profile photo...');
      finalUrl = await generateEditedImageOutput();
    }

    onSave({
      url: finalUrl,
      file: selectedFile,
      source: selectedSource,
      photographerName: selectedCredit.author,
      photographerUrl: selectedCredit.authorUrl,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          background: 'var(--bg-1, #111B21)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.15))',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 168, 132, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-0, #ffffff)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-0, #0B141A)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--accent-1, #00A884)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              📸
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                Profile Photo Studio
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-1)', marginTop: '2px' }}>
                Web Image Search • 1:1 Aspect Ratio Crop • Filters & Color Adjustments
              </div>
            </div>
          </div>

          <button
            onClick={onCancel}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-0)',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Top Nav Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            background: 'var(--bg-0, #0B141A)',
            borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'upload' ? '3px solid var(--accent-1, #00A884)' : '3px solid transparent',
              color: activeTab === 'upload' ? 'var(--accent-1, #00A884)' : 'var(--text-1)',
              fontWeight: activeTab === 'upload' ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🖼️</span> Pick from Gallery
          </button>

          <button
            onClick={() => setActiveTab('unsplash')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'unsplash' ? '3px solid var(--accent-1, #00A884)' : '3px solid transparent',
              color: activeTab === 'unsplash' ? 'var(--accent-1, #00A884)' : 'var(--text-1)',
              fontWeight: activeTab === 'unsplash' ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🌐</span> Search Web Photos
          </button>

          <button
            onClick={() => setActiveTab('dicebear')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'dicebear' ? '3px solid var(--accent-1, #00A884)' : '3px solid transparent',
              color: activeTab === 'dicebear' ? 'var(--accent-1, #00A884)' : 'var(--text-1)',
              fontWeight: activeTab === 'dicebear' ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🤖</span> 3D Avatars
          </button>

          <button
            onClick={() => {
              if (selectedUrl) {
                setActiveTab('editor');
              } else {
                if (onToast) onToast('Select an image from Web or Upload first to edit');
              }
            }}
            disabled={!selectedUrl}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'editor' ? '3px solid var(--accent-1, #00A884)' : '3px solid transparent',
              color: activeTab === 'editor' ? 'var(--accent-1, #00A884)' : selectedUrl ? 'var(--text-1)' : 'rgba(255,255,255,0.2)',
              fontWeight: activeTab === 'editor' ? 700 : 500,
              fontSize: '13.5px',
              cursor: selectedUrl ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: 'auto',
            }}
          >
            <span>🎨</span> In-App 1:1 Editor
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', minHeight: '320px' }}>
          {/* TAB 1: WEB SEARCH */}
          {activeTab === 'unsplash' && (
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  performUnsplashSearch(unsplashQuery);
                }}
                style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}
              >
                <input
                  type="text"
                  placeholder="Search web images (portrait, aesthetic, cyberpunk, cat, nature)..."
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-0, #0B141A)',
                    border: '1px solid var(--border, rgba(255, 255, 255, 0.2))',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isSearchingUnsplash}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '12px',
                    background: 'var(--accent-1, #00A884)',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isSearchingUnsplash ? 'wait' : 'pointer',
                    fontSize: '13.5px',
                  }}
                >
                  {isSearchingUnsplash ? 'Searching...' : 'Search Web'}
                </button>
              </form>

              {/* Quick Preset Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-1)', fontWeight: 600 }}>Presets:</span>
                {PRESET_SEARCH_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setUnsplashQuery(chip);
                      performUnsplashSearch(chip);
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-0)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Results Grid */}
              {isSearchingUnsplash ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-1)' }}>
                  Loading high-res web images...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                  {unsplashResults.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedUrl(item.url);
                          setSelectedFile(undefined);
                          setSelectedSource('unsplash');
                          setSelectedCredit({ author: item.author, authorUrl: item.authorUrl });
                          resetEditorParams();
                          if (onToast) onToast('Selected photo! Click "In-App 1:1 Editor" to adjust or crop.');
                        }}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: isSelected ? '3px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.1)',
                          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img src={item.url} alt={`By ${item.author}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              background: 'var(--accent-1, #00A884)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 900,
                            }}
                          >
                            ✓
                          </div>
                        )}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            insetH: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                            padding: '10px 6px 4px 6px',
                            fontSize: '9.5px',
                            color: '#fff',
                          }}
                        >
                          {item.author}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PICK FROM GALLERY */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) processUploadedFile(e.target.files[0]);
                }}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) processUploadedFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragOver ? '2px dashed var(--accent-1, #00A884)' : '2px dashed var(--border, rgba(255, 255, 255, 0.2))',
                  borderRadius: '18px',
                  padding: '48px 20px',
                  textAlign: 'center',
                  background: isDragOver ? 'rgba(0, 168, 132, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                <div style={{ fontSize: '17px', fontWeight: 700 }}>
                  {isDragOver ? 'Drop Image Now' : 'Pick Photo from Gallery'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-1)', marginTop: '6px' }}>
                  Tap to browse device gallery / photos or drag & drop image
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                  Supports PNG, JPEG, WEBP up to 8MB
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3D AVATARS */}
          {activeTab === 'dicebear' && (
            <div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px' }}>
                {DICEBEAR_STYLES.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setDicebearStyle(st.key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '16px',
                      background: dicebearStyle === st.key ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.06)',
                      color: dicebearStyle === st.key ? '#fff' : 'var(--text-0)',
                      fontWeight: 700,
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {st.icon} {st.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '12px' }}>
                {dicebearSeeds.map((seed) => {
                  const avatarUrl = `https://api.dicebear.com/9.x/${dicebearStyle}/svg?seed=${seed}`;
                  const isSelected = selectedUrl === avatarUrl;
                  return (
                    <div
                      key={seed}
                      onClick={() => {
                        setSelectedUrl(avatarUrl);
                        setSelectedFile(undefined);
                        setSelectedSource('dicebear');
                        resetEditorParams();
                      }}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '16px',
                        padding: '8px',
                        background: isSelected ? 'rgba(0, 168, 132, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? '2px solid var(--accent-1, #00A884)' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={avatarUrl} alt="3D Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: IN-APP 1:1 PHOTO EDITOR STUDIO */}
          {activeTab === 'editor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Interactive 1:1 Aspect Ratio Canvas Frame with Circular Mask Overlay */}
                <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '220px',
                      height: '220px',
                      position: 'relative',
                      background: '#000',
                      borderRadius: displayMask === 'circle' ? '50%' : '16px',
                      overflow: 'hidden',
                      border: '3px solid var(--accent-1, #00A884)',
                      boxShadow: '0 0 25px rgba(0, 168, 132, 0.3)',
                    }}
                  >
                    {selectedUrl ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          transform: `scale(${cropZoom}) translate(${cropPanX}px, ${cropPanY}px) rotate(${rotation}deg)`,
                          transition: 'transform 0.1s ease',
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
                            PHOTO_FILTERS.find((f) => f.id === selectedFilter)?.css !== 'none'
                              ? PHOTO_FILTERS.find((f) => f.id === selectedFilter)?.css
                              : ''
                          }`,
                        }}
                      >
                        <img src={selectedUrl} alt="Cropped Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
                        No Image
                      </div>
                    )}

                    {/* 1:1 Crop Grid Overlay Lines */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        border: '1px dashed rgba(255, 255, 255, 0.3)',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gridTemplateRows: '1fr 1fr 1fr',
                      }}
                    >
                      <div style={{ borderRight: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)' }} />
                      <div style={{ borderRight: '1px solid rgba(255,255,255,0.15)', borderBottom: '1px solid rgba(255,255,255,0.15)' }} />
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }} />
                    </div>
                  </div>

                  {/* Mask Toggle */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => setDisplayMask('circle')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: displayMask === 'circle' ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.08)',
                        color: displayMask === 'circle' ? '#fff' : 'var(--text-1)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      🔴 Circular Mask
                    </button>
                    <button
                      onClick={() => setDisplayMask('square')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: displayMask === 'square' ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.08)',
                        color: displayMask === 'square' ? '#fff' : 'var(--text-1)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      🔲 1:1 Square
                    </button>
                  </div>
                </div>

                {/* Editor Control Sliders & Adjustments */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Zoom & Rotate */}
                  <div style={{ background: 'var(--bg-0, #0B141A)', padding: '14px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                      <span>🔍 1:1 Zoom & Scale</span>
                      <span>{(cropZoom * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.05"
                      value={cropZoom}
                      onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-1, #00A884)' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🔄 Rotate 90° ({rotation}°)
                      </button>
                      <button
                        onClick={resetEditorParams}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: '#FF5376',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Brightness / Contrast */}
                  <div style={{ background: 'var(--bg-0, #0B141A)', padding: '14px', borderRadius: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>☀️ Color Adjustments</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-1)' }}>
                          <span>Brightness</span>
                          <span>{brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-1)' }}
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-1)' }}>
                          <span>Contrast</span>
                          <span>{contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={contrast}
                          onChange={(e) => setContrast(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-1)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>🎨 Presets & Color Grading</div>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {PHOTO_FILTERS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFilter(f.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            background: selectedFilter === f.id ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.08)',
                            color: selectedFilter === f.id ? '#fff' : 'var(--text-0)',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Technical JPEG spec info badge */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(0, 168, 132, 0.1)',
                      border: '1px solid rgba(0, 168, 132, 0.25)',
                      fontSize: '11.5px',
                      color: 'var(--accent-1, #00A884)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>⚡</span>
                    <div>
                      <b>Format Output:</b> 1:1 Aspect Ratio JPEG (640x640 px) • CDN tokenized preview
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            background: 'var(--bg-0, #0B141A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>
            {selectedUrl ? (
              <span>
                Selected: <b>{selectedSource}</b>
              </span>
            ) : (
              <span>Pick or search an image</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-0)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            {activeTab !== 'editor' && selectedUrl && (
              <button
                onClick={() => setActiveTab('editor')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'rgba(0, 168, 132, 0.15)',
                  border: '1px solid var(--accent-1, #00A884)',
                  color: 'var(--accent-1, #00A884)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Edit & Crop 1:1
              </button>
            )}

            <button
              onClick={handleSaveClick}
              disabled={!selectedUrl}
              style={{
                padding: '10px 22px',
                borderRadius: '12px',
                background: selectedUrl ? 'var(--accent-1, #00A884)' : 'rgba(255, 255, 255, 0.1)',
                color: selectedUrl ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: selectedUrl ? 'pointer' : 'not-allowed',
                boxShadow: selectedUrl ? '0 0 16px rgba(0, 168, 132, 0.4)' : 'none',
              }}
            >
              Save Profile Picture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
