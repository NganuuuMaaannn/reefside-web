'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = '/video/ripsayd4-scrub.mp4';

type ScrollVideo2Props = {
  triggerRef?: RefObject<HTMLElement | null>;
};

export default function ScrollVideo2({ triggerRef }: ScrollVideo2Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  useGSAP(
    () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      let scrubRaf = 0;
      let targetTime = 0;
      let renderedTime = 0;
      let lastSeekedTime = -1;

      const syncVideoTime = () => {
        const diff = targetTime - renderedTime;

        if (Math.abs(diff) < 0.012) {
          renderedTime = targetTime;
        } else {
          renderedTime += diff * 0.08;
        }

        if (Math.abs(renderedTime - lastSeekedTime) > 0.03) {
          lastSeekedTime = renderedTime;
          video.currentTime = renderedTime;
        }

        if (Math.abs(targetTime - renderedTime) > 0.012) {
          scrubRaf = requestAnimationFrame(syncVideoTime);
        } else {
          scrubRaf = 0;
        }
      };

      const initScrollScrub = () => {
        if (initializedRef.current) return;

        const dur = video.duration;
        if (!isFinite(dur) || dur <= 0) return;
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

            const fadeIn = smoothStep(gsap.utils.clamp(0, 1, (self.progress - 0.15) / 0.35));
            if (canvasHidden) {
              gsap.set(video, { opacity: fadeIn });
            } else {
              gsap.set([video, canvas], { opacity: fadeIn });
            }

            if (!scrubRaf) {
              scrubRaf = requestAnimationFrame(syncVideoTime);
            }

            if (!canvasHidden && self.progress > 0.05) {
              canvasHidden = true;
              gsap.to(canvas, { opacity: 0, duration: 0.3, ease: 'power1.out' });
            }
          },
        });

        ScrollTrigger.refresh();

        requestAnimationFrame(() => {
          window.scrollBy(0, 2);
          requestAnimationFrame(() => window.scrollBy(0, -2));
        });
      };

      const captureFirstFrame = () => {
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

        const v = video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => void };
        if (v.requestVideoFrameCallback) {
          v.requestVideoFrameCallback(() => {
            draw();
            initScrollScrub();
          });
        } else {
          video.addEventListener('seeked', () => {
            draw();
            initScrollScrub();
          }, { once: true });
          video.currentTime = 0.1;
        }
      };

      const start = async () => {
        try {
          await video.play();
          video.pause();
          video.currentTime = 0;
        } catch {}
        captureFirstFrame();
      };

      const fallback = window.setTimeout(() => initScrollScrub(), 5000);
      const handleError = () => initScrollScrub();

      video.addEventListener('loadeddata', start, { once: true });
      video.addEventListener('error', handleError, { once: true });

      return () => {
        if (scrubRaf) {
          cancelAnimationFrame(scrubRaf);
        }
        window.clearTimeout(fallback);
        video.removeEventListener('loadeddata', start);
        video.removeEventListener('error', handleError);
      };
    },
    { dependencies: [triggerRef], scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="relative z-0">
      <div className="fixed inset-0 z-0 h-screen w-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          src={VIDEO_SRC}
          className="scrollvid2-video absolute inset-0 h-full w-full object-cover opacity-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      </div>
    </div>
  );
}
