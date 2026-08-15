'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

type LightboxValue = {
  src: string;
  alt: string;
};

type LightboxContextType = {
  openLightbox: (value: LightboxValue) => void;
};

const LightboxContext = createContext<LightboxContextType | null>(null);

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
}

type LightboxProviderProps = {
  children: ReactNode;
};

const CLOSE_PICTURE_MS = 500;
const CLOSE_BACKDROP_DELAY_MS = 300;
const CLOSE_TOTAL_MS = CLOSE_PICTURE_MS + CLOSE_BACKDROP_DELAY_MS + 100;

const SCROLL_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
];

export function LightboxProvider({ children }: LightboxProviderProps) {
  const [value, setValue] = useState<LightboxValue | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const openLightbox = useCallback((next: LightboxValue) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setClosing(false);
    setValue(next);
  }, []);

  const closeLightbox = useCallback(() => {
    setClosing(true);
    if (closeTimerRef.current === null) {
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setValue(null);
        setClosing(false);
      }, CLOSE_TOTAL_MS);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!value) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onWheelCapture = (event: WheelEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener('wheel', onWheelCapture, {
      passive: false,
      capture: true,
    });

    const onTouchMoveCapture = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };
    document.addEventListener('touchmove', onTouchMoveCapture, {
      passive: false,
      capture: true,
    });

    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.includes(event.key)) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDownCapture, { capture: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('wheel', onWheelCapture, { capture: true });
      document.removeEventListener('touchmove', onTouchMoveCapture, {
        capture: true,
      });
      window.removeEventListener('keydown', onKeyDownCapture, { capture: true });
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [value, closeLightbox]);

  const contextValue = useMemo(() => ({ openLightbox }), [openLightbox]);

  return (
    <LightboxContext.Provider value={contextValue}>
      {children}
      {value
        ? createPortal(
            <LightboxOverlay value={value} closing={closing} onClose={closeLightbox} />,
            document.body
          )
        : null}
    </LightboxContext.Provider>
  );
}

type LightboxOverlayProps = {
  value: LightboxValue;
  closing: boolean;
  onClose: () => void;
};

function LightboxOverlay({ value, closing, onClose }: LightboxOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const showing = mounted && !closing;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-10"
      style={{
        opacity: closing ? 0 : 1,
        transition: `opacity ${CLOSE_PICTURE_MS}ms ease-out ${
          closing ? `${CLOSE_BACKDROP_DELAY_MS}ms` : '0ms'
        }`,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={value.alt}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 md:right-6 md:top-6"
        aria-label="Close fullscreen"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <Image
        src={value.src}
        alt={value.alt}
        width={1200}
        height={900}
        sizes="100vw"
        priority
        onClick={(event) => event.stopPropagation()}
        style={{
          filter: showing ? 'blur(0px)' : 'blur(16px)',
          opacity: showing ? 1 : 0,
          transform: showing ? 'scale(1)' : 'scale(1.04)',
          transition: `filter ${CLOSE_PICTURE_MS}ms ease-out, opacity ${CLOSE_PICTURE_MS}ms ease-out, transform ${CLOSE_PICTURE_MS}ms ease-out`,
        }}
        className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
      />
    </div>
  );
}

type LightboxButtonProps = {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
  label?: string;
};

export function LightboxButton({
  src,
  alt,
  children,
  className = '',
  label,
}: LightboxButtonProps) {
  const { openLightbox } = useLightbox();

  const open = useCallback(() => openLightbox({ src, alt }), [openLightbox, src, alt]);

  return (
    <div className={`relative block h-full w-full overflow-hidden pointer-events-auto ${className}`}>
      {children}

      <button
        type="button"
        onClick={open}
        className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors duration-300 hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white/60 md:bottom-3 md:right-3"
        aria-label={label ?? `View ${alt} fullscreen`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </button>
    </div>
  );
}
