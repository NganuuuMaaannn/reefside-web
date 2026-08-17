'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { LightboxButton } from './Lightbox';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  { src: '/images/reef9.jpg', alt: 'Reefside gallery feature' },
  { src: '/images/reef8.jpg', alt: 'Reefside gallery detail 1' },
  { src: '/images/reef5.jpg', alt: 'Reefside gallery detail 2' },
];

export default function GallerySection() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set('.gallery-viewport', { autoAlpha: 1 });
        gsap.set('.gallery-frame', {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
        });
        return;
      }

      gsap.set('.gallery-viewport', { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      tl.to('.gallery-viewport', { autoAlpha: 1, duration: 0.03 }, 0);

      tl.fromTo(
        '.gallery-frame',
        {
          autoAlpha: 0,
          y: '42vh',
          scale: 1.03,
          filter: 'blur(14px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.3,
          stagger: 0.03,
          ease: 'power2.out',
        },
        0.04
      );

      tl.to('.gallery-viewport', {
        scale: 0.82,
        autoAlpha: 0,
        filter: 'blur(12px)',
        ease: 'power1.in',
        duration: 0.4,
      }, 0.6);
    },
    { scope: wrapperRef }
  );

  return (
    <div ref={wrapperRef} className="gallery-section relative z-20 h-[150vh]">
      <section className="gallery-viewport pointer-events-none fixed inset-0 z-20 flex h-screen items-center overflow-hidden px-5 py-16 opacity-0">
        <div className="relative z-10 mx-auto grid h-[min(72vh,760px)] w-full max-w-295 grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr] md:gap-5">
          <div className="gallery-frame relative overflow-hidden rounded-lg bg-[#111] opacity-0">
            <LightboxButton src={galleryImages[0].src} alt={galleryImages[0].alt} className="rounded-lg">
              <Image
                src={galleryImages[0].src}
                alt={galleryImages[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            </LightboxButton>
          </div>

          <div className="grid min-h-0 grid-rows-2 gap-4 md:gap-5">
            {galleryImages.slice(1).map((image) => (
              <div
                key={image.src}
                className="gallery-frame relative min-h-0 overflow-hidden rounded-lg bg-[#111] opacity-0"
              >
                <LightboxButton src={image.src} alt={image.alt} className="rounded-lg">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </LightboxButton>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
