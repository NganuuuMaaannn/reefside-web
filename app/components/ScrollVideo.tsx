'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IS_MOBILE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
// On touch devices use a ~720p, short-keyframe (0.5s) re-encode (~20x smaller)
// so each seek decodes far fewer pixels and at most one keyframe interval.
const VIDEO_SRC = IS_MOBILE
  ? '/video/ripsayd2-scrub-mobile.mp4'
  : '/video/ripsayd2-scrub.mp4';

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

      // Note: both desktop and mobile use the throttled RAF-eased scrub loop below.
      // The old synchronous `variable.currentTime = t` seek-in-scroll-callback path
      // (previously branch on IS_MOBILE) was removed because seeking on every scroll
      // update overrode the decoder and caused stutter / freeze on touch devices.

      let scrubRaf = 0;
      let targetTime = 0;
      let renderedTime = 0;
      let lastSeekedTime = -1;
      let durationRetries = 0;
      const MAX_DURATION_RETRIES = 30;
      let retryTimer = 0;

      // ── Seek-serialized pacing ─────────────────────────────────────────────
      // Writing `video.currentTime` forces the decoder to seek. If we issue a new
      // seek before the previous one finishes, browsers override the in-flight
      // seek and the decoder falls behind → stutter and perceived lag. So we
      // serialize: start a seek only when none is in flight, remember the newest
      // requested time meanwhile, and flush it once the current seek completes.
      // The RAF loop stays alive the whole time so scrolling keeps easing toward
      // the target smoothly on every device — only the seek *issue rate* is
      // throttled to the decoder's actual throughput.

      const SEEK_GAP = 0.03;
      let seekInFlight = false;
      let seekPendingTime: number | null = null;
      let seekDeadline = 0;

      const requestSeek = (time: number) => {
        if (seekInFlight) {
          seekPendingTime = time; // newest request wins; applied on 'seeked'
          return;
        }

        const diff = Math.abs(time - lastSeekedTime);
        if (diff < SEEK_GAP) {
          lastSeekedTime = time; // within tolerance, no decoder work needed
          return;
        }

        seekInFlight = true;
        lastSeekedTime = time;
        window.clearTimeout(seekDeadline);
        // Safety net: never let a dropped 'seeked' event lock the scrub forever.
        seekDeadline = window.setTimeout(() => {
          seekInFlight = false;
        }, 500);

        video.currentTime = time;
      };

      const onLockedSeeked = () => {
        window.clearTimeout(seekDeadline);
        seekInFlight = false;
      };

      video.addEventListener('seeked', onLockedSeeked);

      // ── Scrub loop ─────────────────────────────────────────────────────────
      // Desktop keeps the original eager strategy: write `currentTime` every
      // eased frame and let the browser coalesce the rapid writes into a single
      // seek toward the newest position. That avoids decoding intermediate
      // frames and stays perfectly smooth on fast decoders. On touch devices we
      // serialize instead (one seek in flight, newest target banked) because a
      // phone decoder can't absorb uncoalesced seeks — combined with the ~720p
      // short-keyframe mobile file, each seek now costs very little.
      const syncVideoTime = () => {
        const diff = targetTime - renderedTime;

        if (Math.abs(diff) < 0.008) {
          renderedTime = targetTime;
        } else {
          renderedTime += diff * 0.35;
        }

        if (IS_MOBILE) {
          requestSeek(renderedTime);
        } else if (Math.abs(renderedTime - lastSeekedTime) > 0.02) {
          lastSeekedTime = renderedTime;
          video.currentTime = renderedTime;
        }

        const stillMoving = Math.abs(targetTime - renderedTime) > 0.008;
        if (stillMoving || (IS_MOBILE && (seekInFlight || seekPendingTime !== null))) {
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
              // Force the video onto the final frame: the end state should be
              // deterministic on every device, regardless of video state.
              seekPendingTime = null;
              seekInFlight = false;
              window.clearTimeout(seekDeadline);
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

      const forceLoad = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => video.pause()).catch(() => {});
        } else {
          window.setTimeout(() => video.pause(), 250);
        }
      };

      const onMetadata = () => {
        forceLoad();
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
      video.addEventListener('canplay', initScrollScrub, { once: true });
      video.addEventListener('error', handleError, { once: true });

      return () => {
        if (scrubRaf) {
          cancelAnimationFrame(scrubRaf);
        }
        window.clearTimeout(fallback);
        window.clearTimeout(retryTimer);
        window.clearTimeout(seekDeadline);
        video.removeEventListener('seeked', onLockedSeeked);
        video.removeEventListener('loadedmetadata', onMetadata);
        video.removeEventListener('canplay', initScrollScrub);
        video.removeEventListener('error', handleError);
      };
    },
    { dependencies: [onReady], scope: wrapperRef }
  );

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
    <div ref={wrapperRef} className="relative z-0 h-full bg-black">
      <div className="fixed inset-0 h-screen w-full overflow-hidden">
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
