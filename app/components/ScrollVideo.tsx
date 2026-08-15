'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = '/video/ripsayd2-scrub.mp4';

type ScrollVideoProps = {
  onReady?: () => void;
};

export default function ScrollVideo({ onReady }: ScrollVideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useGSAP(
    () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;
      if (!video || !canvas || !overlay) return;

      let scrubRaf = 0;
      let targetTime = 0;
      let renderedTime = 0;
      let lastSeekedTime = -1;

      const syncVideoTime = () => {
        const diff = targetTime - renderedTime;

        if (Math.abs(diff) < 0.012) {
          renderedTime = targetTime;
        } else {
          renderedTime += diff * 0.16;
        }

        if (Math.abs(renderedTime - lastSeekedTime) > 0.045) {
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

        gsap.set([video, canvas], { opacity: 0.82 });

        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=400%',
          scrub: true,
          onUpdate: (self) => {
            targetTime = self.progress * finalTime;
            const revealProgress = smoothStep(gsap.utils.clamp(0, 1, (self.progress - 0.03) / 0.18));
            const dipProgress = smoothStep(gsap.utils.clamp(0, 1, (self.progress - 0.72) / 0.18));

            if (self.progress > 0.985) {
              targetTime = finalTime;
              renderedTime = finalTime;
              lastSeekedTime = finalTime;
              video.currentTime = finalTime;
              gsap.set(overlay, { opacity: 1 });
            } else {
              gsap.set(overlay, { opacity: Math.max(1 - revealProgress, dipProgress) });
            }

            if (!scrubRaf) {
              scrubRaf = requestAnimationFrame(syncVideoTime);
            }

            if (!canvasHidden && self.progress > 0) {
              canvasHidden = true;
              gsap.to(canvas, { opacity: 0, duration: 0.2, ease: 'power1.out' });
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

      const fallback = window.setTimeout(() => initScrollScrub(), 5000);
      const handleError = () => initScrollScrub();

      video.addEventListener('loadedmetadata', captureFirstFrame, { once: true });
      video.addEventListener('error', handleError, { once: true });

      return () => {
        if (scrubRaf) {
          cancelAnimationFrame(scrubRaf);
        }
        window.clearTimeout(fallback);
        video.removeEventListener('loadedmetadata', captureFirstFrame);
        video.removeEventListener('error', handleError);
      };
    },
    { dependencies: [onReady], scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="relative z-0 h-full bg-black">
      <div className="fixed inset-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          controlsList="nodownload"
          disablePictureInPicture
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black opacity-100"
        />
      </div>
    </div>
  );
}
