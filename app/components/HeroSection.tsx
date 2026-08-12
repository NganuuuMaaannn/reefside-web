'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';

const introEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
const heroBackgroundOpacity = 0.35;

const logoIntro: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.18,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: 0.45,
      duration: 0.9,
      ease: introEase,
    },
  },
};

const cardIntro: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.1,
    y: 18,
    filter: 'blur(10px)',
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.8 + index * 0.14,
      duration: 0.9,
      ease: introEase,
    },
  }),
};

const heroImages = [
  { src: '/images/reef1.jpg', alt: 'Reefside product 1' },
  { src: '/images/1.jpg', alt: 'Reefside product 2' },
  { src: '/images/reef2.jpg', alt: 'Reefside product 3' },
];

export default function HeroSection() {
  return (
    <div className="relative z-10 h-[180vh]">
      <section
        className="sticky top-0 flex min-h-screen flex-col items-center justify-center px-5 py-[60px] gap-[60px]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1/2 overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)]">
          <Image
            src="/images/bg1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ opacity: heroBackgroundOpacity }}
          />
        </div>

        <motion.img
          src="/images/reefside.png"
          alt="Reefside"
          className="relative z-10 w-[clamp(150px,30vw,300px)] h-auto  will-change-transform"
          variants={logoIntro}
          initial="hidden"
          animate="visible"
        />

        <div className="relative z-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-7.5 max-w-[1000px] w-full">
          {heroImages.map((image, index) => (
            <motion.div
              key={image.src}
              className="relative bg-[#111] rounded-xl overflow-hidden aspect-[3/4] will-change-transform"
              variants={cardIntro}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 333px"
                className="object-cover"
              />
            </motion.div>
          ))}
        </div>

        <p className="relative z-10 text-[10px] text-[#555] uppercase tracking-[0.2em] animate-bounce">
          Scroll down to explore
        </p>
      </section>
    </div>
  );
}
