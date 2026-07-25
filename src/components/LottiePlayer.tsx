import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

interface LottiePlayerProps {
  src?: string;
  animationData?: any;
  style?: React.CSSProperties;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  fallbackSvg?: string;
  lazy?: boolean;
}

const lottieCache = new Map<string, any>();

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  src,
  animationData: initialData,
  style,
  className,
  loop = true,
  autoplay = true,
  fallbackSvg,
  lazy = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(!lazy);
  const [data, setData] = useState<any>(initialData || (src ? lottieCache.get(src) : null));
  const [error, setError] = useState(false);

  // IntersectionObserver for lazy viewport detection
  useEffect(() => {
    if (!lazy) {
      setIsVisible(true);
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '350px 0px 350px 0px', threshold: 0.01 }
      );

      observer.observe(element);
      return () => {
        if (element) observer.unobserve(element);
      };
    } else {
      setIsVisible(true);
    }
  }, [lazy]);

  useEffect(() => {
    if (!isVisible) return;

    if (initialData) {
      setData(initialData);
      return;
    }

    if (!src) return;

    if (lottieCache.has(src)) {
      setData(lottieCache.get(src));
      return;
    }

    let isMounted = true;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Lottie animation');
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          lottieCache.set(src, json);
          setData(json);
        }
      })
      .catch((err) => {
        console.warn('Lottie fetch error, using fallback', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [src, initialData, isVisible]);

  if (error || (!data && fallbackSvg)) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
        dangerouslySetInnerHTML={{ __html: fallbackSvg || '' }}
      />
    );
  }

  if (!data || !isVisible) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40px',
          ...style,
        }}
      >
        {fallbackSvg ? (
          <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: fallbackSvg }} />
        ) : (
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255,255,255,0.15)',
              borderTopColor: 'var(--accent-1, #00F0FF)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', ...style }}>
      <Lottie
        animationData={data}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
        className={className}
      />
    </div>
  );
};

