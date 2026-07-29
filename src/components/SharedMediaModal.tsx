import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface SharedMediaModalProps {
  roomName: string;
  messages: ChatMessage[];
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const SharedMediaModal: React.FC<SharedMediaModalProps> = ({
  roomName,
  messages,
  onClose,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'links'>('media');

  // Filter messages for Media
  const mediaItems = messages.filter(
    (m) => m.type === 'sticker' || m.type === 'sketch' || (m.text && (m.text.includes('http') || m.text.includes('.png') || m.text.includes('.jpg')))
  );

  // Filter messages for Docs
  const docItems = messages.filter((m) => m.type === 'doc');

  // Filter messages containing URL Links
  const linkItems = messages.filter(
    (m) => m.type === 'text' && m.text && /https?:\/\/[^\s]+/.test(m.text)
  );

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
          width: '560px',
          maxWidth: '94vw',
          height: '520px',
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
        {/* Header */}
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
            <div style={{ fontSize: '18px', fontWeight: 700 }}>📁 Shared Media & Files</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              {roomName}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-2, #202c33)' }}>
          {[
            { id: 'media', label: `Media (${mediaItems.length + 4})` },
            { id: 'docs', label: `Docs (${docItems.length + 3})` },
            { id: 'links', label: `Links (${linkItems.length + 2})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '3px solid var(--accent-1, #00A884)' : '3px solid transparent',
                color: activeTab === t.id ? 'var(--accent-1, #00A884)' : 'rgba(255,255,255,0.6)',
                fontWeight: activeTab === t.id ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'media' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '10px',
              }}
            >
              {/* Sample High Quality Preset Media Cards */}
              {[
                { name: 'Photo_ Kampala_Sunset.jpg', bg: 'linear-gradient(135deg, #FF9A6F, #FF5376)', ic: '🌄' },
                { name: 'Design_Mockup_v2.png', bg: 'linear-gradient(135deg, #6C8CFF, #8FA0B8)', ic: '🎨' },
                { name: 'Project_Architecture.png', bg: 'linear-gradient(135deg, #00A884, #0b141a)', ic: '🏗️' },
                { name: 'Vacation_Snap.jpg', bg: 'linear-gradient(135deg, #B388FF, #FFD36F)', ic: '🏖️' },
              ].map((m, i) => (
                <div
                  key={i}
                  onClick={() => onToast(`Viewing ${m.name}`)}
                  style={{
                    height: '110px',
                    borderRadius: '10px',
                    background: m.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{m.ic}</span>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      left: '6px',
                      right: '6px',
                      fontSize: '10px',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                    }}
                  >
                    {m.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Meeting_Agenda_2026.pdf', size: '2.4 MB', date: 'Yesterday' },
                { name: 'Financial_Report_Q2.xlsx', size: '1.8 MB', date: 'Jul 24' },
                { name: 'Source_Code_Archive.zip', size: '14.2 MB', date: 'Jul 18' },
              ].map((d, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-2, #202c33)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📄</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                        {d.size} • {d.date}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToast(`Downloading ${d.name}...`)}
                    style={{
                      background: 'var(--accent-1, #00A884)',
                      border: 'none',
                      color: '#000',
                      padding: '6px 12px',
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

          {activeTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Google AI Studio Build Platform', url: 'https://ai.studio/build', desc: 'Natural language full-stack application builder' },
                { title: 'React Documentation & Hooks', url: 'https://react.dev', desc: 'The library for web and native user interfaces' },
              ].map((l, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-2, #202c33)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-1, #00A884)' }}>
                    {l.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: '4px 0' }}>
                    {l.url}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{l.desc}</div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(l.url);
                        onToast('Link copied to clipboard!');
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      📋 Copy Link
                    </button>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        textDecoration: 'none',
                      }}
                    >
                      ↗ Open Link
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
