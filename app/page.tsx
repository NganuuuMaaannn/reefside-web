'use client';

import dynamic from 'next/dynamic';

const ScrollVideo = dynamic(() => import('./components/ScrollVideo'), { ssr: false });

export default function Home() {
  return <ScrollVideo />;
}
