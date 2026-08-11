'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = '/video/ripsayd2-scrub.mp4';

export default function ScrollVideo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useGSAP(
    () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const initScrollScrub = () => {
        const dur = video.duration;
        if (!isFinite(dur) || dur <= 0) return;

        let lastTime = -1;
        let canvasHidden = false;

        setLoading(false);

        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0,
          onUpdate: (self) => {
            const time = self.progress * dur;
            if (Math.abs(time - lastTime) > 0.04) {
              lastTime = time;
              video.currentTime = time;
            }
            if (!canvasHidden && self.progress > 0) {
              canvasHidden = true;
              gsap.to(canvas, { opacity: 0, duration: 0.15 });
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

      video.addEventListener('loadeddata', start, { once: true });

      const fallbackTimeout = setTimeout(() => {
        if (loading) initScrollScrub();
      }, 5000);

      video.addEventListener('error', () => {
        clearTimeout(fallbackTimeout);
        setLoading(false);
      }, { once: true });
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} style={{ height: '400vh', background: '#000' }}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        src={VIDEO_SRC}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          opacity: 0.4,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          color: '#fff',
          zIndex: 50,
        }}>
          <p>Loading video...</p>
        </div>
      )}
      <img
        src="/images/reefside.png"
        alt="Reefside"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(200px, 40vw, 300px)',
          height: 'auto',
          zIndex: 10,
          pointerEvents: 'none',
          display: loading ? 'none' : 'block',
        }}
      />
    </div>
  );
}
