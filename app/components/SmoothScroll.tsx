'use client';

import { useEffect, useRef } from 'react';

const EASE = 0.14;

type SmoothScrollProps = {
  disabled?: boolean;
};

export default function SmoothScroll({ disabled = false }: SmoothScrollProps) {
  const disabledRef = useRef(disabled);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let currentY = window.scrollY;
    let targetY = window.scrollY;
    let rafId = 0;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const clampScroll = (value: number) =>
      Math.min(maxScroll(), Math.max(0, value));

    const stopAnimation = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const syncToNativeScroll = () => {
      if (rafId) {
        targetY = clampScroll(targetY);
        return;
      }
      currentY = window.scrollY;
      targetY = currentY;
    };

    const tick = () => {
      currentY += (targetY - currentY) * EASE;

      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        rafId = 0;
        return;
      }

      window.scrollTo(0, currentY);
      rafId = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;

      event.preventDefault();

      if (disabledRef.current) return;

      const deltaMultiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 18
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;

      targetY = clampScroll(targetY + event.deltaY * deltaMultiplier);

      if (!rafId) {
        currentY = window.scrollY;
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', syncToNativeScroll);
    window.addEventListener('scroll', syncToNativeScroll, { passive: true });
    window.addEventListener('beforeunload', stopAnimation);

    return () => {
      stopAnimation();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', syncToNativeScroll);
      window.removeEventListener('scroll', syncToNativeScroll);
      window.removeEventListener('beforeunload', stopAnimation);
    };
  }, []);

  return null;
}
