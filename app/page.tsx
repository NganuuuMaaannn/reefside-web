'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { LightboxProvider } from './components/Lightbox';

const HeroSection = dynamic(() => import('./components/HeroSection'), { ssr: false });
const GallerySection = dynamic(() => import('./components/GallerySection'), { ssr: false });
const EditorialScroll = dynamic(() => import('./components/EditorialScroll'), { ssr: false });
const SplitSection = dynamic(() => import('./components/SplitSection'), { ssr: false });
const OutroSection = dynamic(() => import('./components/OutroSection'), { ssr: false });
const IntroLoader = dynamic(() => import('./components/IntroLoader'), { ssr: false });
const ScrollVideo = dynamic(() => import('./components/ScrollVideo'), { ssr: false });
const SmoothScroll = dynamic(() => import('./components/SmoothScroll'), { ssr: false });

export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const [video2Ready, setVideo2Ready] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const handleVideoReady = useCallback(() => setVideoReady(true), []);
  const handleVideo2Ready = useCallback(() => setVideo2Ready(true), []);
  const handleIntroComplete = useCallback(() => setIntroDone(true), []);

  const allVideoReady = videoReady && video2Ready;

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (introDone) {
      window.scrollTo(0, 0);
    }
  }, [introDone]);

  return (
    <div className="relative isolate min-h-[400vh] overflow-x-hidden bg-black cursor-default">
      <LightboxProvider>
        <IntroLoader videoReady={allVideoReady} onIntroComplete={handleIntroComplete} />
        <SmoothScroll disabled={!introDone} />
        <div className="absolute inset-x-0 top-0 z-0 h-[400vh]">
          <ScrollVideo onReady={handleVideoReady} />
        </div>
        <div className="relative z-10">
          <HeroSection introDone={introDone} />
          <div className="h-[220vh]" aria-hidden="true" />
          <GallerySection />
          <EditorialScroll onVideoReady={handleVideo2Ready} />
          <SplitSection />
          <OutroSection />
        </div>
      </LightboxProvider>
    </div>
  );
}
