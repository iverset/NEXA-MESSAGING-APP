import React, { useState, useEffect, useRef } from 'react';
import { Story, StatusItem } from '../types';
import { CachedAvatar } from './CachedAvatar';
import { MapPin, Lock, Eye, X, MoreVertical, Music, Send, Heart, Trash2 } from 'lucide-react';

interface StatusViewerModalProps {
  stories: Story[];
  initialStoryId: string | number;
  onClose: () => void;
  onReplyToStory: (contactName: string, replyText: string) => void;
  onDeleteStatusItem: (storyId: string | number, itemId: string) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  stories,
  initialStoryId,
  onClose,
  onReplyToStory,
  onDeleteStatusItem,
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(() => {
    const idx = stories.findIndex((s) => String(s.id) === String(initialStoryId));
    return idx >= 0 ? idx : 0;
  });

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const currentStory = stories[currentStoryIndex] || stories[0];
  const items = currentStory?.items || [];
  const currentItem: StatusItem | undefined = items[currentItemIndex] || {
    id: 'st-def',
    type: 'text',
    caption: 'Status update',
    textOverlay: 'Hello!',
    bgColor: 'linear-gradient(135deg, #00A884, #005C4B)',
    createdAt: 'Just now',
  };

  const isMine = currentStory?.mine;

  // Auto-advance progress timer
  useEffect(() => {
    if (isPaused || showViewersDrawer || showMenu) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next item
          if (currentItemIndex < items.length - 1) {
            setCurrentItemIndex((i) => i + 1);
            return 0;
          } else if (currentStoryIndex < stories.length - 1) {
            // Next story user
            setCurrentStoryIndex((s) => s + 1);
            setCurrentItemIndex(0);
            return 0;
          } else {
            // Reached end of all stories
            onClose();
            return 100;
          }
        }
        return prev + 2; // 5 second duration per item
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, currentStoryIndex, currentItemIndex, items.length, stories.length, showViewersDrawer, showMenu, onClose]);

  const handleNext = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex((i) => i + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((s) => s + 1);
      setCurrentItemIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((i) => i - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((s) => s - 1);
      const prevItems = stories[currentStoryIndex - 1]?.items || [];
      setCurrentItemIndex(prevItems.length > 0 ? prevItems.length - 1 : 0);
      setProgress(0);
    }
  };

  const handleSendReply = (textToSend?: string) => {
    const finalMsg = textToSend || replyText;
    if (!finalMsg.trim()) return;
    onReplyToStory(currentStory.name, finalMsg);
    setReplyText('');
  };

  const handleDeleteCurrent = () => {
    if (currentItem && currentStory) {
      onDeleteStatusItem(currentStory.id, currentItem.id);
      setShowMenu(false);
      if (items.length <= 1) {
        onClose();
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#080C0E',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        userSelect: 'none',
      }}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Dash Progression Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          padding: '10px 12px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          {items.map((it, idx) => (
            <div
              key={it.id || idx}
              style={{
                flex: 1,
                height: '3px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: '#fff',
                  width:
                    idx < currentItemIndex
                      ? '100%'
                      : idx === currentItemIndex
                      ? `${progress}%`
                      : '0%',
                  transition: idx === currentItemIndex ? 'width 0.1s linear' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={currentStory.avatar}
              alt={currentStory.name}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #00A884',
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isMine ? 'Your Story' : currentStory.name}
                <span
                  style={{
                    fontSize: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: '8px',
                  }}
                >
                  🔒 Contacts
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                {currentItem.createdAt || currentStory.timeAgo || 'Recently'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isMine && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ⋮
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '22px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Main Status Canvas Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: currentItem.type === 'text' ? currentItem.bgColor || 'linear-gradient(135deg, #00A884, #005C4B)' : '#000',
        }}
      >
        {/* Left & Right Tap Hotspots */}
        <div
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: 0,
            top: '70px',
            bottom: '80px',
            width: '35%',
            zIndex: 10,
            cursor: 'pointer',
          }}
        />
        <div
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: 0,
            top: '70px',
            bottom: '80px',
            width: '35%',
            zIndex: 10,
            cursor: 'pointer',
          }}
        />

        {/* Media Image */}
        {currentItem.type === 'image' && currentItem.mediaUrl && (
          <img
            src={currentItem.mediaUrl}
            alt="Status media"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter:
                currentItem.filter === 'pop'
                  ? 'saturate(1.8)'
                  : currentItem.filter === 'bw'
                  ? 'grayscale(1)'
                  : 'none',
            }}
          />
        )}

        {/* Text Overlay */}
        {currentItem.textOverlay && (
          <div
            style={{
              position: 'absolute',
              zIndex: 5,
              padding: '24px',
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 800,
              color: currentItem.textColor || '#fff',
              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              maxWidth: '85%',
            }}
          >
            {currentItem.textOverlay}
          </div>
        )}

        {/* Stickers */}
        {currentItem.stickers?.map((stk) => (
          <div
            key={stk.id}
            style={{
              position: 'absolute',
              left: `${stk.x}%`,
              top: `${stk.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 8,
              background: 'rgba(0,0,0,0.6)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {stk.content}
          </div>
        ))}

        {/* Music Track Badge overlay */}
        {currentItem.music && (
          <div
            style={{
              position: 'absolute',
              top: '85px',
              left: '16px',
              zIndex: 12,
              background: 'rgba(17, 27, 33, 0.85)',
              border: '1px solid var(--accent-1, #00A884)',
              borderRadius: '20px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '16px' }}>🎵</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{currentItem.music.title}</div>
              <div style={{ fontSize: '10px', color: '#00A884' }}>{currentItem.music.artist}</div>
            </div>
          </div>
        )}

        {/* Fixed Caption at Base */}
        {currentItem.caption && (
          <div
            style={{
              position: 'absolute',
              bottom: '90px',
              left: 0,
              right: 0,
              zIndex: 12,
              textAlign: 'center',
              padding: '12px 20px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              fontSize: '15px',
              fontWeight: 500,
            }}
          >
            {currentItem.caption}
          </div>
        )}
      </div>

      {/* Bottom Interactive Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 25,
          padding: '12px 16px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {isMine ? (
          /* Own Status Viewers Tracker Bar */
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowViewersDrawer(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <span>👁️</span>
            <span>
              {currentItem.viewers?.length || 0} Viewers · Swipe up to view
            </span>
          </div>
        ) : (
          /* Contact Status Reply Bar */
          <div>
            {/* Quick Reactions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              {['❤️', '🔥', '😂', '👏', '😮', '🙏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendReply(`Reacted ${emoji} to your status`);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendReply();
                }}
                placeholder={`Reply to ${currentStory.name}...`}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 16px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendReply();
                }}
                style={{
                  background: '#00A884',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Modal (Delete status) */}
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '16px',
            zIndex: 40,
            background: '#111B21',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            width: '160px',
          }}
        >
          <button
            onClick={handleDeleteCurrent}
            style={{
              width: '100%',
              padding: '12px',
              background: 'none',
              border: 'none',
              color: '#FF3B30',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            🗑️ Delete Status
          </button>
        </div>
      )}

      {/* Viewers Sliding Drawer */}
      {showViewersDrawer && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            background: '#111B21',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              Status Viewers ({currentItem.viewers?.length || 0})
            </span>
            <button
              onClick={() => setShowViewersDrawer(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!currentItem.viewers || currentItem.viewers.length === 0) ? (
              <div style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>
                No views yet. Share your status to contacts!
              </div>
            ) : (
              currentItem.viewers.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                  }}
                >
                  <img
                    src={v.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=75'}
                    alt={v.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{v.name}</div>
                    <div style={{ fontSize: '11px', color: '#00A884' }}>{v.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
