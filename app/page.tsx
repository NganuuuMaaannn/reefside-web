'use client';

import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('./components/HeroSection'), { ssr: false });
const GallerySection = dynamic(() => import('./components/GallerySection'), { ssr: false });
const ScrollVideo = dynamic(() => import('./components/ScrollVideo'), { ssr: false });
const SmoothScroll = dynamic(() => import('./components/SmoothScroll'), { ssr: false });

export default function Home() {
  return (
    <div className="relative isolate min-h-[400vh] overflow-x-hidden bg-black cursor-default">
      <SmoothScroll />
      <div className="absolute inset-x-0 top-0 z-0 h-[400vh]">
        <ScrollVideo />
      </div>
      <div className="relative z-10">
        <HeroSection />
        <div className="h-[220vh]" aria-hidden="true" />
        <GallerySection />
      </div>
    </div>
  );
}
