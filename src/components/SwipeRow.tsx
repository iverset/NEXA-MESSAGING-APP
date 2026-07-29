import React, { useCallback, useRef, useState } from 'react';

export function haptic(ms: number = 12) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(ms);
    }
  } catch {
    /* vibration unsupported — silently ignore */
  }
}

interface SwipeRowProps {
  children: React.ReactNode;
  /** Fired once the row has been dragged past the threshold and released. */
  onSwipeLeft: () => void;
  /** Label shown in the revealed action tray. */
  actionLabel: string;
  /** Icon shown in the revealed action tray. */
  actionIcon: React.ReactNode;
  /** Background colour of the revealed action tray. */
  actionColor?: string;
  /** Distance in px the row must travel to commit the action. */
  threshold?: number;
  disabled?: boolean;
  /** Rounded corners, used for the archive folder bar. */
  radius?: number;
}

const MAX_DRAG = 150;

/**
 * A row that can be dragged right-to-left to trigger a single action.
 * Uses Pointer Events so it works identically with touch and with a mouse.
 */
export const SwipeRow: React.FC<SwipeRowProps> = ({
  children,
  onSwipeLeft,
  actionLabel,
  actionIcon,
  actionColor = 'var(--accent-1, #00A884)',
  threshold = 88,
  disabled = false,
  radius = 0,
}) => {
  const [dx, setDx] = useState(0);
  const [flying, setFlying] = useState(false);

  const startRef = useRef<{ x: number; y: number } | null>(null);
  const axisRef = useRef<'none' | 'h' | 'v'>('none');
  const buzzedRef = useRef(false);
  // True when the pointer travelled far enough that the gesture should
  // swallow the click that the browser fires on pointerup.
  const draggedRef = useRef(false);

  const reset = useCallback(() => {
    startRef.current = null;
    axisRef.current = 'none';
    buzzedRef.current = false;
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || flying) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    axisRef.current = 'none';
    buzzedRef.current = false;
    draggedRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current || flying) return;

    const ddx = e.clientX - startRef.current.x;
    const ddy = e.clientY - startRef.current.y;

    // Decide once whether this gesture is a horizontal swipe or a vertical scroll.
    if (axisRef.current === 'none') {
      if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return;
      axisRef.current = Math.abs(ddx) > Math.abs(ddy) ? 'h' : 'v';
      if (axisRef.current === 'h') {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }
    }
    // Let the scroll container own vertical gestures.
    if (axisRef.current !== 'h') return;

    const next = Math.max(-MAX_DRAG, Math.min(0, ddx));
    if (next < -4) draggedRef.current = true;
    setDx(next);

    // Single crisp buzz the moment the action arms itself.
    if (-next >= threshold && !buzzedRef.current) {
      buzzedRef.current = true;
      haptic(14);
    } else if (-next < threshold) {
      buzzedRef.current = false;
    }
  };

  const onPointerUp = () => {
    if (!startRef.current) return;
    const shouldCommit = -dx >= threshold;
    reset();

    if (shouldCommit) {
      setFlying(true);
      setDx(-520); // slide the row clean off the panel
      haptic(22);
      window.setTimeout(() => {
        onSwipeLeft();
        setFlying(false);
        setDx(0);
      }, 200);
    } else {
      setDx(0);
    }
  };

  const progress = Math.min(1, -dx / threshold);
  const armed = -dx >= threshold;

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        touchAction: 'pan-y',
      }}
    >
      {/* Action tray revealed underneath the row */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          paddingRight: '18px',
          background: actionColor,
          opacity: dx === 0 ? 0 : 0.25 + progress * 0.75,
          color: '#fff',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.2px',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transform: `scale(${armed ? 1 : 0.8 + progress * 0.2})`,
            transition: 'transform 120ms ease',
          }}
        >
          {actionIcon}
          {actionLabel}
        </span>
      </div>

      {/* The row itself */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e) => {
          if (draggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            draggedRef.current = false;
          }
        }}
        style={{
          position: 'relative',
          transform: `translate3d(${dx}px, 0, 0)`,
          transition: startRef.current ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          background: 'var(--bg-0, #0B141A)',
          borderRadius: radius,
        }}
      >
        {children}
      </div>
    </div>
  );
};
