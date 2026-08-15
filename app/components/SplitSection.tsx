'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { LightboxButton } from './Lightbox';

gsap.registerPlugin(ScrollTrigger);

export default function SplitSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!wrapperRef.current || !gridRef.current) return;

      const scrollvidFixed = Array.from(
        document.querySelectorAll<HTMLElement>('.scrollvid2-fixed')
      );

      if (prefersReducedMotion) {
        gsap.set(scrollvidFixed, { opacity: 0 });
        return;
      }

      gsap.fromTo(
        scrollvidFixed,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top bottom',
            end: 'top 15%',
            scrub: 0.8,
          },
        }
      );
    },
    { scope: wrapperRef, dependencies: [prefersReducedMotion] }
  );

  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ['start 0.95', 'start 0.15'],
  });

  const leftOpacity = useTransform(
    scrollYProgress,
    [0, 0.55],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const leftY = useTransform(
    scrollYProgress,
    [0, 0.7],
    prefersReducedMotion ? [0, 0] : [110, 0]
  );
  const leftBlur = useTransform(
    scrollYProgress,
    [0, 0.55],
    prefersReducedMotion
      ? ['blur(0px)', 'blur(0px)']
      : ['blur(10px)', 'blur(0px)']
  );

  const rightOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.67],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const rightY = useTransform(
    scrollYProgress,
    [0.12, 0.82],
    prefersReducedMotion ? [0, 0] : [110, 0]
  );
  const rightBlur = useTransform(
    scrollYProgress,
    [0.12, 0.67],
    prefersReducedMotion
      ? ['blur(0px)', 'blur(0px)']
      : ['blur(10px)', 'blur(0px)']
  );

  return (
    <div ref={wrapperRef} className="split-section relative z-30 w-full">
      <section className="relative flex min-h-screen w-full items-center justify-center px-4 py-24 md:px-6 lg:px-10">
        <div
          ref={gridRef}
          className="grid w-full max-w-295 grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5"
        >
          <motion.div
            className="split-frame relative overflow-hidden rounded-xl bg-[#111] md:mt-20 lg:mt-24 duration-700 hover:scale-99"
            style={{
              aspectRatio: '4/5',
              opacity: leftOpacity,
              y: leftY,
              filter: leftBlur,
            }}
          >
            <LightboxButton src="/images/reef15.jpg" alt="Reefside split one" className="rounded-xl">
              <Image
                src="/images/reef15.jpg"
                alt="Reefside split one"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </LightboxButton>
          </motion.div>

          <motion.div
            className="split-frame relative overflow-hidden rounded-xl bg-[#111] duration-700 hover:scale-99"
            style={{
              aspectRatio: '4/5',
              opacity: rightOpacity,
              y: rightY,
              filter: rightBlur,
            }}
          >
            <LightboxButton src="/images/reef16.jpg" alt="Reefside split two" className="rounded-xl">
              <Image
                src="/images/reef16.jpg"
                alt="Reefside split two"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </LightboxButton>
          </motion.div>
        </div>
      </section>
      <div className="h-[40vh]" aria-hidden="true" />
    </div>
  );
}
