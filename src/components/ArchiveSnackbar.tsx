import React, { useEffect } from 'react';
import { Archive } from 'lucide-react';

interface ArchiveSnackbarProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

export const ArchiveSnackbar: React.FC<ArchiveSnackbarProps> = ({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}) => {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(t);
  }, [onDismiss, duration, message]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute',
        left: '12px',
        right: '12px',
        bottom: '16px',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 12px 10px 14px',
        borderRadius: '12px',
        background: 'var(--bg-3, #233138)',
        border: '1px solid var(--border, rgba(255,255,255,0.12))',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        animation: 'snackIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          fontSize: '12.5px',
          fontWeight: 600,
          color: 'var(--text-0)',
          minWidth: 0,
        }}
      >
        <Archive size={16} style={{ flexShrink: 0, color: 'var(--accent-1, #00A884)' }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {message}
        </span>
      </span>

      <button
        onClick={onUndo}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--accent-1, #00A884)',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.6px',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: '6px',
          flexShrink: 0,
        }}
      >
        UNDO
      </button>
    </div>
  );
};
