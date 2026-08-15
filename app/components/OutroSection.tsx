'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const SHOP_URL = 'https://reefsidesurfco.com';

export default function OutroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const splitSection = document.querySelector<HTMLElement>('.split-section');
      const container = wrapperRef.current.querySelector<HTMLElement>('.outro-fixed');

      gsap.set(container, { autoAlpha: 0 });

      if (prefersReducedMotion) {
        if (splitSection) {
          gsap.set(splitSection, { scale: 1, opacity: 1 });
        }
        gsap.set('.outro-item', { autoAlpha: 1, y: 0, filter: 'blur(0px)' });

        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: 'top bottom',
          end: 'top top',
          onToggle: (self) => {
            gsap.to(container, { autoAlpha: self.isActive ? 1 : 0, duration: 0.4 });
          },
        });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.8,
        },
      });

      if (splitSection) {
        tl.fromTo(
          splitSection,
          { scale: 1, opacity: 1 },
          { scale: 0.9, opacity: 0, duration: 0.8, ease: 'power2.in' },
          0
        );
      }

      tl.fromTo(
        container,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6, ease: 'power1.out' },
        0
      ).fromTo(
        '.outro-bg',
        { scale: 1.1 },
        { scale: 1, duration: 1, ease: 'power1.out' },
        0
      ).fromTo(
        '.outro-item',
        {
          autoAlpha: 0,
          y: 48,
          filter: 'blur(10px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.45,
          stagger: 0.1,
          ease: 'power3.out',
        },
        0.15
      );
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="outro-section relative z-20 w-full">
      <div className="outro-fixed pointer-events-none fixed inset-0 z-0">
        <div className="outro-bg absolute inset-0 overflow-hidden">
          <Image
            src="/images/outro.jpg"
            alt="Reefside Surf Co. outro"
            fill
            sizes="100vw"
            className="object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-black/60" />

        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center p-6 md:p-10 lg:p-16">
          <div className="flex flex-col items-center gap-12 sm:flex-row sm:gap-16 lg:gap-24">
            <div className="outro-item relative aspect-square h-auto w-[clamp(190px,30vw,360px)]">
              <Image
                src="/images/reefside.png"
                alt="Reefside"
                fill
                sizes="360px"
                className="object-contain duration-1000 hover:scale-102"
              />
            </div>

            <div className="flex flex-col items-center gap-9">
              <div className="outro-item">
                <a
                  href={SHOP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fluid-btn"
                  aria-label="Shop Now"
                >
                  <span className="fluid-btn-overlay" aria-hidden="true" />
                  <span className="fluid-btn-label-stack">
                    <span className="fluid-btn-label">Shop Now</span>
                  </span>
                </a>
              </div>

              <div className="grid w-[320px] max-w-full grid-cols-2 gap-6">
                <a
                  href="https://www.facebook.com/reefsidesurfcodavao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outro-item flex items-center justify-center gap-2.5 text-[12px] uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 hover:text-white hover"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
                  </svg>
                  Facebook
                </a>

                <a
                  href="https://www.instagram.com/reefsidesurfco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outro-item flex items-center justify-center gap-2.5 text-[12px] uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[110vh]" aria-hidden="true" />
    </div>
  );
}
