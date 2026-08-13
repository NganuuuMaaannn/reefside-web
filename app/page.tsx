'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

const HeroSection = dynamic(() => import('./components/HeroSection'), { ssr: false });
const GallerySection = dynamic(() => import('./components/GallerySection'), { ssr: false });
const IntroLoader = dynamic(() => import('./components/IntroLoader'), { ssr: false });
const ScrollVideo = dynamic(() => import('./components/ScrollVideo'), { ssr: false });
const SmoothScroll = dynamic(() => import('./components/SmoothScroll'), { ssr: false });

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const handleVideoReady = useCallback(() => setVideoReady(true), []);

  return (
    <div className="relative isolate min-h-[400vh] overflow-x-hidden bg-black cursor-default">
      <IntroLoader videoReady={videoReady} />
      <SmoothScroll />
      <div className="absolute inset-x-0 top-0 z-0 h-[400vh]">
        <ScrollVideo onReady={handleVideoReady} />
      </div>
      <div className="relative z-10">
        <HeroSection />
        <div className="h-[220vh]" aria-hidden="true" />
        <GallerySection />
      </div>
    </div>
  );
}
