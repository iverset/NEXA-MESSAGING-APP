import React, { useState } from 'react';

interface MediaLightboxModalProps {
  mediaUrl: string;
  type: 'photo' | 'video';
  title?: string;
  senderName?: string;
  timestamp?: string;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  mediaUrl,
  type,
  title = 'Media View',
  senderName = 'Nexa User',
  timestamp = 'Just now',
  onClose,
  onToast,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    onToast?.(`Downloading ${type === 'photo' ? 'Image' : 'Video'}...`);
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `Nexa_Media_${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`;
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mediaUrl);
    onToast?.('Media link copied to clipboard!');
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    onToast?.(`Playback speed set to ${speed}x`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
      }}
      onClick={onClose}
    >
      {/* Top Header Controls Bar */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--accent-1, #00A884)',
              color: '#000',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>{senderName}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{timestamp}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {type === 'photo' && (
            <>
              <button
                onClick={handleZoomOut}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                title="Zoom Out"
              >
                🔍 -
              </button>
              <span style={{ fontSize: '12px', opacity: 0.8, minWidth: '40px', textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                title="Zoom In"
              >
                🔍 +
              </button>
              <button
                onClick={handleRotate}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
                title="Rotate 90°"
              >
                🔄
              </button>
              {(zoom !== 1 || rotation !== 0) && (
                <button
                  onClick={handleResetZoom}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Reset
                </button>
              )}
            </>
          )}

          {type === 'video' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px' }}>
              {[1, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  style={{
                    background: playbackSpeed === speed ? 'var(--accent-1, #00A884)' : 'transparent',
                    color: playbackSpeed === speed ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleDownload}
            style={{ background: 'var(--accent-1, #00A884)', border: 'none', color: '#000', fontWeight: 700, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px' }}
          >
            ⬇ Download
          </button>

          <button
            onClick={handleCopyLink}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
            title="Copy Link"
          >
            🔗
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{ background: showInfo ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
            title="Media Info"
          >
            ℹ️
          </button>

          <button
            onClick={onClose}
            style={{ background: 'rgba(255,69,58,0.3)', border: 'none', color: '#FF453A', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'photo' ? (
          <img
            src={mediaUrl}
            alt={title}
            style={{
              maxHeight: '85vh',
              maxWidth: '90vw',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.25s cubic-bezier(0.1, 0.9, 0.2, 1)',
            }}
          />
        ) : (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <video
              ref={videoRef}
              src={mediaUrl}
              autoPlay
              controls
              style={{
                maxHeight: '80vh',
                maxWidth: '90vw',
                borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Side Info Panel if toggled */}
        {showInfo && (
          <div
            style={{
              position: 'absolute',
              right: '24px',
              top: '24px',
              width: '280px',
              background: 'rgba(20, 28, 34, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-1, #00A884)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
              📊 Media Information
            </div>
            <div><strong>Type:</strong> {type.toUpperCase()}</div>
            <div><strong>Sender:</strong> {senderName}</div>
            <div><strong>Sent:</strong> {timestamp}</div>
            <div><strong>Dimensions:</strong> {type === 'photo' ? '1920 × 1080 (HD)' : '1080p 60fps'}</div>
            <div><strong>Size:</strong> {type === 'photo' ? '2.8 MB' : '18.4 MB'}</div>
            <div><strong>Storage:</strong> Cached in Nexa Local Vault</div>
          </div>
        )}
      </div>
    </div>
  );
};
