import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { MediaLightboxModal } from './MediaLightboxModal';

interface SharedMediaModalProps {
  roomName?: string;
  messages: ChatMessage[];
  onClose: () => void;
  onToast?: (msg: string) => void;
}

interface CloudFile {
  id: string;
  name: string;
  type: 'photo' | 'video' | 'doc' | 'audio' | 'archive';
  size: string;
  date: string;
  url?: string;
  sender?: string;
}

export const SharedMediaModal: React.FC<SharedMediaModalProps> = ({
  roomName = 'Chat Conversation',
  messages = [],
  onClose,
  onToast = console.log,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'audio' | 'links' | 'cloud' | 'storage'>('media');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxItem, setLightboxItem] = useState<{ url: string; type: 'photo' | 'video'; name: string } | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Default rich mock items supplemented by real chat messages
  const defaultPhotos: CloudFile[] = [
    { id: 'm1', name: 'Kampala_Sunset_Panorama.jpg', type: 'photo', size: '3.4 MB', date: 'Today, 09:41', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', sender: 'Kato Mukasa' },
    { id: 'm2', name: 'Nexa_UI_Design_System.png', type: 'photo', size: '2.1 MB', date: 'Yesterday', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80', sender: 'Babirye Kintu' },
    { id: 'm3', name: 'Buganda_Artistic_Sketch.jpg', type: 'photo', size: '4.8 MB', date: 'Jul 28', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', sender: 'Ronald Ssemwanga' },
    { id: 'm4', name: 'Team_Launch_Celebration.mp4', type: 'video', size: '18.2 MB', date: 'Jul 25', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', sender: 'Sarah Namubiru' },
  ];

  const defaultDocs: CloudFile[] = [
    { id: 'd1', name: 'Kampala_App_Launch_Strategy.pdf', type: 'doc', size: '2.8 MB', date: 'Yesterday', sender: 'Kato Mukasa' },
    { id: 'd2', name: 'Financial_Budget_Q3_2026.xlsx', type: 'doc', size: '1.4 MB', date: 'Jul 26', sender: 'Alex Vance' },
    { id: 'd3', name: 'Nexa_Core_Source_Bundle.zip', type: 'archive', size: '15.9 MB', date: 'Jul 20', sender: 'Sarah Namubiru' },
  ];

  const defaultAudio: CloudFile[] = [
    { id: 'a1', name: 'Voice Note (0:42) - Ki gano Mukwano.m4a', type: 'audio', size: '820 KB', date: 'Today, 08:12', sender: 'Babirye Kintu' },
    { id: 'a2', name: 'Project_Discussion_Audio.mp3', type: 'audio', size: '4.2 MB', date: 'Jul 24', sender: 'Ronald Ssemwanga' },
  ];

  const defaultLinks = [
    { id: 'l1', title: 'Google AI Studio Build Platform', url: 'https://ai.studio/build', desc: 'Natural language application creation environment', date: 'Jul 29' },
    { id: 'l2', title: 'React Documentation & Specs', url: 'https://react.dev', desc: 'The library for web and native user interfaces', date: 'Jul 22' },
  ];

  // Extract from actual chat messages
  const chatPhotos: CloudFile[] = messages
    .filter((m) => m.type === 'photo' || (m.mediaUrl && m.type !== 'video'))
    .map((m, idx) => ({
      id: `c_p_${idx}`,
      name: m.name || `Photo_${idx + 1}.jpg`,
      type: 'photo',
      size: '2.5 MB',
      date: m.time || 'Recent',
      url: m.mediaUrl || m.text,
      sender: m.from === 'me' ? 'You' : 'User',
    }));

  const chatVideos: CloudFile[] = messages
    .filter((m) => m.type === 'video')
    .map((m, idx) => ({
      id: `c_v_${idx}`,
      name: m.name || `Video_${idx + 1}.mp4`,
      type: 'video',
      size: '12.4 MB',
      date: m.time || 'Recent',
      url: m.mediaUrl,
      sender: m.from === 'me' ? 'You' : 'User',
    }));

  const allPhotosAndVideos = [...chatPhotos, ...chatVideos, ...defaultPhotos];
  const allDocs = [...messages.filter((m) => m.type === 'doc').map((m, idx) => ({ id: `c_d_${idx}`, name: m.name || `Document_${idx + 1}.pdf`, type: 'doc' as const, size: '1.8 MB', date: m.time || 'Recent', sender: m.from === 'me' ? 'You' : 'User' })), ...defaultDocs];
  const allAudio = [...messages.filter((m) => m.type === 'voice').map((m, idx) => ({ id: `c_a_${idx}`, name: `Voice Note (${m.dur || '0:15'})`, type: 'audio' as const, size: '450 KB', date: m.time || 'Recent', sender: m.from === 'me' ? 'You' : 'User' })), ...defaultAudio];

  // Filter by search query
  const filteredMedia = allPhotosAndVideos.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDocs = allDocs.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAudio = allAudio.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLinks = defaultLinks.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.url.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkDownload = () => {
    onToast(`Downloading ${selectedIds.length} selected items to device... ⬇`);
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleBulkDelete = () => {
    onToast(`Removed ${selectedIds.length} items from media index`);
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
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
          width: '720px',
          maxWidth: '95vw',
          height: '620px',
          maxHeight: '92vh',
          background: 'var(--bg-1, #111b21)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📁</span>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 700 }}>Shared Media & Vault</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                {roomName} • {allPhotosAndVideos.length + allDocs.length + allAudio.length} Items Total
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsSelectMode(!isSelectMode)}
              style={{
                background: isSelectMode ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: isSelectMode ? '#000' : '#fff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isSelectMode ? 'Cancel Selection' : 'Select Items'}
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Bar & Tab Selection */}
        <div style={{ background: 'var(--bg-2, #202c33)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '10px 16px 0 16px' }}>
          {/* Instant Search Field */}
          <div style={{ marginBottom: '10px', position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search files by name, type, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'media', label: `🖼️ Media (${filteredMedia.length})` },
              { id: 'docs', label: `📄 Docs (${filteredDocs.length})` },
              { id: 'audio', label: `🎧 Audio (${filteredAudio.length})` },
              { id: 'links', label: `🔗 Links (${filteredLinks.length})` },
              { id: 'cloud', label: `☁️ Cloud Vault` },
              { id: 'storage', label: `💾 Storage & Cache` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  padding: '8px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === t.id ? '3px solid var(--accent-1, #00A884)' : '3px solid transparent',
                  color: activeTab === t.id ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.65)',
                  fontWeight: activeTab === t.id ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selection Action Bar */}
        {isSelectMode && selectedIds.length > 0 && (
          <div
            style={{
              padding: '8px 16px',
              background: 'rgba(0, 168, 132, 0.2)',
              borderBottom: '1px solid rgba(0, 168, 132, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-1, #00A884)' }}>
              {selectedIds.length} items selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleBulkDownload}
                style={{ background: 'var(--accent-1, #00A884)', border: 'none', color: '#000', padding: '4px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                ⬇ Bulk Download
              </button>
              <button
                onClick={handleBulkDelete}
                style={{ background: 'rgba(255,69,58,0.3)', border: '1px solid rgba(255,69,58,0.5)', color: '#FF453A', padding: '4px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          {/* TAB 1: MEDIA (PHOTOS & VIDEOS) */}
          {activeTab === 'media' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredMedia.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    if (isSelectMode) {
                      toggleSelect(m.id);
                    } else if (m.url) {
                      setLightboxItem({ url: m.url, type: m.type === 'video' ? 'video' : 'photo', name: m.name });
                    }
                  }}
                  style={{
                    height: '130px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'var(--bg-2, #202c33)',
                    border: selectedIds.includes(m.id) ? '2px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {m.url ? (
                    <img src={m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '32px' }}>
                      {m.type === 'video' ? '🎬' : '🌄'}
                    </div>
                  )}

                  {/* Video Badge */}
                  {m.type === 'video' && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                      ▶ VIDEO
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  {isSelectMode && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', background: selectedIds.includes(m.id) ? 'var(--accent-1, #00A884)' : 'rgba(0,0,0,0.5)', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#000', fontWeight: 800 }}>
                      {selectedIds.includes(m.id) && '✓'}
                    </div>
                  )}

                  {/* Caption Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                      padding: '12px 6px 6px 6px',
                      fontSize: '10px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ opacity: 0.7, fontSize: '9px' }}>{m.size} • {m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: DOCUMENTS & FILES */}
          {activeTab === 'docs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredDocs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => isSelectMode && toggleSelect(d.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-2, #202c33)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: selectedIds.includes(d.id) ? '2px solid var(--accent-1, #00A884)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isSelectMode && (
                      <input type="checkbox" checked={selectedIds.includes(d.id)} readOnly style={{ accentColor: 'var(--accent-1, #00A884)' }} />
                    )}
                    <span style={{ fontSize: '28px' }}>📄</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                        {d.size} • {d.sender} • {d.date}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToast(`Downloading ${d.name}... ⬇`);
                    }}
                    style={{
                      background: 'var(--accent-1, #00A884)',
                      border: 'none',
                      color: '#000',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Download ⬇
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: AUDIO & VOICE NOTES */}
          {activeTab === 'audio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredAudio.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-2, #202c33)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => onToast(`Playing ${a.name} 🎧`)}
                      style={{
                        background: 'var(--accent-1, #00A884)',
                        border: 'none',
                        color: '#000',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      ▶
                    </button>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                        {a.size} • {a.sender} • {a.date}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToast(`Saving ${a.name} to device...`)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Save Audio
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SHARED LINKS */}
          {activeTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredLinks.map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'var(--bg-2, #202c33)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-1, #00A884)' }}>
                    {l.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '4px 0' }}>
                    {l.url}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{l.desc}</div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(l.url);
                        onToast('Link copied to clipboard!');
                      }}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      📋 Copy Link
                    </button>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', textDecoration: 'none' }}
                    >
                      ↗ Open Link
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: CLOUD VAULT INTEGRATION */}
          {activeTab === 'cloud' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(0,168,132,0.12)', border: '1px solid rgba(0,168,132,0.3)', borderRadius: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-1, #00A884)' }}>
                  ☁️ Nexa Cloud Vault Connected
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>
                  Your attachments are automatically mirrored to end-to-end encrypted Nexa Storage. Access them securely anywhere.
                </div>
              </div>

              {['📷 Shared Camera Roll', '📑 Project Contracts & PDFs', '🎙️ Voice Archives'].map((folder, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-2, #202c33)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{folder}</div>
                  <button
                    onClick={() => onToast(`Opened Cloud Folder: ${folder}`)}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Browse Folder 📁
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: STORAGE & CACHE MANAGER */}
          {activeTab === 'storage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-2, #202c33)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>💾 Nexa Local Vault Storage</span>
                  <span style={{ fontSize: '12px', color: 'var(--accent-1, #00A884)', fontWeight: 700 }}>
                    {cacheCleared ? '12.4 MB Used / 5.0 GB' : '482.6 MB Used / 5.0 GB'}
                  </span>
                </div>

                {/* Storage Progress Meter */}
                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
                  <div style={{ width: cacheCleared ? '2%' : '40%', background: '#6C8CFF' }} title="Photos & Videos" />
                  <div style={{ width: cacheCleared ? '1%' : '25%', background: '#00A884' }} title="Documents" />
                  <div style={{ width: cacheCleared ? '1%' : '15%', background: '#FFD36F' }} title="Voice & Audio" />
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                  <span>🔵 Photos & Videos ({cacheCleared ? '5.2 MB' : '240 MB'})</span>
                  <span>🟢 Documents ({cacheCleared ? '4.1 MB' : '150 MB'})</span>
                  <span>🟡 Voice Notes ({cacheCleared ? '3.1 MB' : '92 MB'})</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-2, #202c33)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>🧹 Clear Temporary Cache</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                    Frees up disk space without deleting starred messages or cloud files.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCacheCleared(true);
                    onToast('One-Tap Cache Cleaned! Freed 470 MB 🎉');
                  }}
                  style={{
                    background: cacheCleared ? 'rgba(255,255,255,0.1)' : 'var(--accent-1, #00A884)',
                    border: 'none',
                    color: cacheCleared ? '#fff' : '#000',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: cacheCleared ? 'default' : 'pointer',
                    fontSize: '13px',
                  }}
                  disabled={cacheCleared}
                >
                  {cacheCleared ? 'Cache Cleaned ✓' : 'Clear Cache Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal when clicking media item */}
      {lightboxItem && (
        <MediaLightboxModal
          mediaUrl={lightboxItem.url}
          type={lightboxItem.type}
          title={lightboxItem.name}
          onClose={() => setLightboxItem(null)}
          onToast={onToast}
        />
      )}
    </div>
  );
};
