'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type IntroLoaderProps = {
  videoReady: boolean;
  onIntroComplete?: () => void;
};

const MIN_INTRO_MS = 3000;

export default function IntroLoader({ videoReady, onIntroComplete }: IntroLoaderProps) {
  const [minElapsed, setMinElapsed] = useState(false);
  const visible = !(minElapsed && videoReady);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_INTRO_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
          onAnimationComplete={onIntroComplete}
        >
          <motion.img
            src="/images/reefside-logo.png"
            alt="Reefside"
            className="w-[clamp(160px,28vw,340px)] h-auto"
            initial={{ opacity: 0, scale: 1.08, filter: 'blur(24px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(22px)' }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
