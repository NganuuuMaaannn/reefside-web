'use client';

import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('./components/HeroSection'), { ssr: false });
const ScrollVideo = dynamic(() => import('./components/ScrollVideo'), { ssr: false });
const SmoothScroll = dynamic(() => import('./components/SmoothScroll'), { ssr: false });

export default function Home() {
  return (
    <div className="relative isolate h-[400vh] overflow-x-hidden bg-black cursor-default">
      <SmoothScroll />
      <div className="absolute inset-0 z-0">
        <ScrollVideo />
      </div>
      <div className="relative z-10">
        <HeroSection />
      </div>
    </div>
  );
}
