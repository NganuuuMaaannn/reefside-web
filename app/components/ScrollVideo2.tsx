'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = '/video/ripsayd4-scrub.mp4';
const IS_MOBILE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const SEEK_THRESHOLD = IS_MOBILE ? 0.06 : 0.02;
const LERP_FACTOR = IS_MOBILE ? 0.2 : 0.35;

type ScrollVideo2Props = {
  triggerRef?: RefObject<HTMLElement | null>;
  onReady?: () => void;
};

export default function ScrollVideo2({ triggerRef, onReady }: ScrollVideo2Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  const forceVideoLoad = () => {
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => video.pause()).catch(() => {});
    } else {
      window.setTimeout(() => video.pause(), 250);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let observer: IntersectionObserver | null = null;

    const startObserving = () => {
      const target = triggerRef?.current ?? wrapperRef.current;
      if (!target || observer) return;

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          if (video.dataset.fullLoaded === 'true') return;
          video.dataset.fullLoaded = 'true';
          video.preload = 'auto';
          video.addEventListener('loadeddata', forceVideoLoad, { once: true });
          video.load();
          observer?.disconnect();
          observer = null;
        },
        { rootMargin: IS_MOBILE ? '0px 0px 50% 0px' : '0px 0px 200% 0px', threshold: 0 }
      );

      observer.observe(target);
    };

    startObserving();

    return () => {
      observer?.disconnect();
    };
  }, [triggerRef]);

  useGSAP(
    () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      let scrubRaf = 0;
      let targetTime = 0;
      let renderedTime = 0;
      let lastSeekedTime = -1;
      let durationRetries = 0;
      const MAX_DURATION_RETRIES = 30;
      let retryTimer = 0;

      const syncVideoTime = () => {
        const diff = targetTime - renderedTime;

        if (Math.abs(diff) < 0.008) {
          renderedTime = targetTime;
        } else {
          renderedTime += diff * LERP_FACTOR;
        }

        if (Math.abs(renderedTime - lastSeekedTime) > SEEK_THRESHOLD) {
          lastSeekedTime = renderedTime;
          video.currentTime = renderedTime;
        }

        if (Math.abs(targetTime - renderedTime) > 0.008) {
          scrubRaf = requestAnimationFrame(syncVideoTime);
        } else {
          scrubRaf = 0;
        }
      };

      const initScrollScrub = () => {
        if (initializedRef.current) return;

        const dur = video.duration;
        if (!isFinite(dur) || dur <= 0) {
          if (durationRetries < MAX_DURATION_RETRIES) {
            durationRetries += 1;
            window.clearTimeout(retryTimer);
            retryTimer = window.setTimeout(initScrollScrub, 250);
          } else {
            onReady?.();
          }
          return;
        }
        const finalTime = Math.max(0, dur - 0.05);

        initializedRef.current = true;
        targetTime = video.currentTime || 0;
        renderedTime = targetTime;
        lastSeekedTime = targetTime;

        let canvasHidden = false;
        const smoothStep = (progress: number) => progress * progress * (3 - 2 * progress);

        ScrollTrigger.create({
          trigger: triggerRef?.current ?? wrapperRef.current,
          start: 'top top',
          end: '+=400%',
          scrub: true,
          onUpdate: (self) => {
            targetTime = self.progress * finalTime;

            if (IS_MOBILE) {
              const fadeIn = Math.max(0, Math.min(1, (self.progress - 0.15) / 0.35));
              if (canvasHidden) {
                video.style.opacity = String(fadeIn);
              } else {
                video.style.opacity = String(fadeIn);
                canvas.style.opacity = String(fadeIn);
              }

              if (!scrubRaf) {
                scrubRaf = requestAnimationFrame(syncVideoTime);
              }

              if (!canvasHidden && self.progress > 0.01) {
                canvasHidden = true;
                canvas.style.opacity = '0';
              }
            } else {
              const fadeIn = smoothStep(gsap.utils.clamp(0, 1, (self.progress - 0.15) / 0.35));
              if (canvasHidden) {
                gsap.set(video, { opacity: fadeIn });
              } else {
                gsap.set([video, canvas], { opacity: fadeIn });
              }

              if (!scrubRaf) {
                scrubRaf = requestAnimationFrame(syncVideoTime);
              }

              if (!canvasHidden && self.progress > 0.01) {
                canvasHidden = true;
                gsap.to(canvas, { opacity: 0, duration: 0.3, ease: 'power1.out' });
              }
            }
          },
        });

        onReady?.();

        ScrollTrigger.refresh();

        requestAnimationFrame(() => {
          window.scrollBy(0, 2);
          requestAnimationFrame(() => window.scrollBy(0, -2));
        });
      };

      const captureFirstFrame = () => {
        if (IS_MOBILE) {
          initScrollScrub();
          return;
        }

        const draw = () => {
          try {
            const ctx = canvas.getContext('2d');
            if (ctx && video.videoWidth && video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              return true;
            }
          } catch {}
          return false;
        };

        const onSeeked = () => {
          draw();
          initScrollScrub();
        };

        video.addEventListener('seeked', onSeeked, { once: true });
        video.currentTime = 0.1;
      };

      const onMetadata = () => {
        captureFirstFrame();
      };

      const fallback = window.setTimeout(() => {
        if (!initializedRef.current) onReady?.();
        initScrollScrub();
      }, 5000);
      const handleError = () => {
        if (!initializedRef.current) onReady?.();
        initScrollScrub();
      };

      video.addEventListener('loadedmetadata', onMetadata, { once: true });
      // If the browser reports the video can play, try to initialize the scrub immediately.
      video.addEventListener('canplay', initScrollScrub, { once: true });
      video.addEventListener('error', handleError, { once: true });

      return () => {
        if (scrubRaf) {
          cancelAnimationFrame(scrubRaf);
        }
        window.clearTimeout(fallback);
        window.clearTimeout(retryTimer);
        video.removeEventListener('loadedmetadata', onMetadata);
        video.removeEventListener('canplay', initScrollScrub);
        video.removeEventListener('error', handleError);
      };
    },
    { dependencies: [triggerRef, onReady], scope: wrapperRef }
  );

  // Keep ScrollTrigger in sync with common layout events (resize/orientation/pageshow/load).
  useEffect(() => {
    const doRefresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch {}
    };

    window.addEventListener('resize', doRefresh);
    window.addEventListener('orientationchange', doRefresh);
    window.addEventListener('pageshow', doRefresh);
    window.addEventListener('load', doRefresh);

    return () => {
      window.removeEventListener('resize', doRefresh);
      window.removeEventListener('orientationchange', doRefresh);
      window.removeEventListener('pageshow', doRefresh);
      window.removeEventListener('load', doRefresh);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-0">
      <div className="scrollvid2-fixed fixed inset-0 z-0 h-screen w-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          muted
          playsInline
          webkit-playsinline="true"
          preload={IS_MOBILE ? 'metadata' : 'auto'}
          poster="/images/bg1.jpg"
          controlsList="nodownload"
          disablePictureInPicture
          src={VIDEO_SRC}
          onError={() => onReady?.()}
          className="scrollvid2-video absolute inset-0 h-full w-full object-cover opacity-0 will-change-[opacity]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      </div>
    </div>
  );
}
