import React from 'react';

export interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: ToastState | string | null;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return <div className="toast" />;

  const message = typeof toast === 'string' ? toast : toast.message;
  const actionLabel = typeof toast === 'object' ? toast?.actionLabel : undefined;
  const onAction = typeof toast === 'object' ? toast?.onAction : undefined;

  return (
    <div className={`toast ${message ? 'show' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={() => {
            onAction();
            if (onDismiss) onDismiss();
          }}
          style={{
            background: 'var(--accent-1, #00A884)',
            color: '#000',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

