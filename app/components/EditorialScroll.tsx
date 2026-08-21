'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import ScrollVideo2 from './ScrollVideo2';
import { LightboxButton } from './Lightbox';

gsap.registerPlugin(ScrollTrigger);

type EditorialScrollProps = {
  onVideoReady?: () => void;
};

export default function EditorialScroll({ onVideoReady }: EditorialScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!wrapperRef.current) return;
      const elements = wrapperRef.current.querySelectorAll<HTMLElement>('.ed-reveal');
      elements.forEach((el) => {
        if (el.style.opacity === '0' || el.style.visibility === 'hidden') {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
          el.style.transform = 'none';
          el.style.filter = 'none';
        }
      });
    }, 6000);
    return () => window.clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      const elements = gsap.utils.toArray<HTMLElement>('.ed-reveal');

      elements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            autoAlpha: 0,
            y: 80,
            scale: 1.04,
            filter: 'blur(10px)',
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              end: 'top 55%',
              scrub: 0.8,
            },
          }
        );
      });
    },
    { scope: wrapperRef }
  );

  return (
    <div
      ref={wrapperRef}
      className="editorial-scroll-section relative z-30 w-full text-white"
    >
      {/* ── BACKGROUND: scrollvid2 dissolves in as the editorial scrolls ── */}
      <ScrollVideo2 triggerRef={wrapperRef} onReady={onVideoReady} />

      {/* ── MOBILE: vertical stack ── */}
      <section className="relative w-full px-4 pt-12 pb-20 block md:hidden">
        <div className="ed-reveal relative w-full overflow-hidden bg-gray-300 opacity-0 mb-3" style={{ aspectRatio: '3/4' }}>
          <LightboxButton src="/images/reef10.jpg" alt="Reefside editorial hero" className="rounded-none">
            <Image src="/images/reef10.jpg" alt="Reefside editorial hero" fill priority sizes="92vw" className="object-cover" />
          </LightboxButton>
        </div>
        <div className="ed-reveal relative w-full overflow-hidden bg-gray-300 opacity-0 mb-3" style={{ aspectRatio: '3/4' }}>
          <LightboxButton src="/images/reef11.jpg" alt="Reefside editorial" className="rounded-none">
            <Image src="/images/reef11.jpg" alt="Reefside editorial" fill sizes="92vw" className="object-cover" />
          </LightboxButton>
        </div>
        <div className="ed-reveal relative w-full overflow-hidden bg-gray-300 opacity-0 mb-6" style={{ aspectRatio: '16/9' }}>
          <LightboxButton src="/images/reef12.jpg" alt="Reefside editorial landscape" className="rounded-none">
            <Image src="/images/reef12.jpg" alt="Reefside editorial landscape" fill sizes="92vw" loading="eager" className="object-cover" />
          </LightboxButton>
        </div>
        <div className="ed-reveal opacity-0">
          <p className="mb-3 text-[11px] uppercase tracking-[0.25em] text-[#777]">Reefside Surf Co.</p>
          <h2 className="mb-4 font-serif text-[clamp(22px,5vw,36px)] leading-[1.1] tracking-[-0.02em] text-[#e8e8e8]">
            A homegrown Davao brand, inspired by the board-riding lifestyle created to share the stoke since 2006.
          </h2>
          <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-[#555]">Enjoy the Ride</p>
        </div>
      </section>

      {/* ── MD / LG: absolute layout ── */}
      <section
        className="
          relative
          hidden md:block
          min-h-[180vh]
          w-full
          md:px-6
          md:pt-20
          md:pb-28
          lg:px-10
          lg:pb-32
        "
      >
        
        {/* REEF 10 — LARGE RIGHT */}
        <div
          className="
          ed-reveal
          absolute
          z-10
          overflow-hidden
          bg-gray-300
          opacity-0
          rounded-xl

          right-0
          top-[5vh]
          h-[55vh]
          w-[58vw]

          md:right-0
          md:top-[5vh]
          md:h-[58vh]
          md:w-[52vw]

          lg:h-[60%]
          lg:w-[51vw]
        "
        >
          <LightboxButton
            src="/images/reef10.jpg"
            alt="Reefside editorial hero"
            className="rounded-xl"
          >
            <Image
              src="/images/reef10.jpg"
              alt="Reefside editorial hero"
              fill
              priority
              sizes="52vw"
              className="
                object-cover
                transition-transform
                duration-1200
                ease-out
                hover:scale-99
                rounded-xl
              "
            />
          </LightboxButton>
        </div>


        {/* REEF 11 — SMALL LEFT, DIRECTLY BESIDE REEF 10 */}
        <div
          className="
            ed-reveal
            absolute
            z-20
            overflow-hidden
            bg-gray-300
            opacity-0
            rounded-xl

            left-[4%]
            top-[15vh]
            h-[32vh]
            w-[28vw]

            md:left-[80%]
            md:top-[17vh]
            md:h-[38vh]
            md:w-[25vw]

            lg:left-[23%]
            lg:top-[30%]
            lg:h-[30%]
            lg:w-[25%]
          "
        >
          <LightboxButton
            src="/images/reef11.jpg"
            alt="Reefside editorial"
            className="rounded-xl"
          >
            <Image
              src="/images/reef11.jpg"
              alt="Reefside editorial"
              fill
              sizes="24vw"
              className="
                object-cover
                transition-transform
                duration-1200
                ease-out
                hover:scale-98
                rounded-xl
              "
            />
          </LightboxButton>
        </div>


        {/* REEF 12 — DIRECTLY BELOW THE LEFT IMAGE */}
        <div
          className="
            ed-reveal
            absolute
            z-10
            overflow-hidden
            bg-gray-300
            opacity-0
            rounded-xl

            left-[4%]
            top-[47vh]
            h-[38vh]
            w-[48vw]

            md:left-0
            md:top-[59vh]
            md:h-[48vh]
            md:w-[48vw]

            lg:top-[61%]
            lg:h-[50%]
            lg:w-[48%]
          "
        >
          <LightboxButton
            src="/images/reef12.jpg"
            alt="Reefside editorial landscape"
            className="rounded-xl"
          >
            <Image
              src="/images/reef12.jpg"
              alt="Reefside editorial landscape"
              fill
              sizes="47vw"
              loading="eager"
              className="
                object-cover
                transition-transform
                duration-1200
                ease-out
                hover:scale-99
                rounded-xl
              "
            />
          </LightboxButton>
        </div>


        {/* TEXT — BESIDE REEF 12 */}
        <div
          className="
            ed-reveal
            absolute
            z-20
            opacity-0

            left-[50%]
            top-[65vh]
            w-[38vw]

            md:left-[51%]
            md:top-[67vh]
            md:w-[34vw]

            lg:left-[52%]
            lg:top-[75%]
            lg:w-[30vw]
          "
        >
          <p className="mb-3 text-[14px] uppercase tracking-[0.25em] text-gray-300">
            Reefside Surf Co.
          </p>

          <h2
            className="
              mb-4
              font-serif
              text-[clamp(20px,3vw,42px)]
              leading-[1.08]
              tracking-[-0.02em]
              text-[#e8e8e8]
            "
          >
            A homegrown Davao brand, inspired by the board-riding 
            <br />
            lifestyle created to share the stoke since 2006.
          </h2>

          <p className="mt-5 text-[14px] uppercase tracking-[0.2em] text-gray-300">
            Enjoy the Ride
          </p>
        </div>

      </section>

      {/* ── SCROLL ROOM: video keeps scrubbing down to the bottom ── */}
      <div className="h-[220vh]" aria-hidden="true" />
    </div>
  );
}