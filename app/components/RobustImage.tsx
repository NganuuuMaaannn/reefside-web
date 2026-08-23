'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type RobustProps = ImageProps & {
  fallbackSrc?: string;
};

export default function RobustImage({ fallbackSrc, src, alt, ...props }: RobustProps) {
  const [errored, setErrored] = useState(false);
  const fallback = fallbackSrc ?? '/images/bg1.jpg';

  if (errored) {
    // Render a plain image element when Next/Image fails — keeps layout stable.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={typeof src === 'string' ? src : (src as any)?.src ?? fallback}
        alt={alt ?? ''}
        className={(props as any).className}
        style={(props as any).style}
        width={(props as any).width}
        height={(props as any).height}
      />
    );
  }

  return (
    <Image
      {...(props as ImageProps)}
      src={src}
      alt={alt ?? ''}
      onError={(e) => {
        // Basic client-side instrumentation — log failed image loads.
        try {
          // eslint-disable-next-line no-console
          console.warn('RobustImage: failed to load', src, e?.type ?? 'error');
        } catch {}
        setErrored(true);
      }}
    />
  );
}
