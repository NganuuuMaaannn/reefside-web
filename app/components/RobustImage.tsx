'use client';

import Image, { ImageProps } from 'next/image';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { logAssetFailure } from '../utils/instrumentation';

type RobustProps = ImageProps & {
  fallbackSrc?: string;
};

function getImageSource(source: ImageProps['src'] | undefined, fallback: string): string {
  if (typeof source === 'string') {
    return source;
  }

  if (source && typeof source === 'object' && 'src' in source && typeof source.src === 'string') {
    return source.src;
  }

  return fallback;
}

export default function RobustImage({ fallbackSrc, src, alt, ...props }: RobustProps) {
  const [errored, setErrored] = useState(false);
  const fallback = fallbackSrc ?? '/images/bg1.jpg';
  const imgSrc = getImageSource(src, fallback);
  const imgClassName = typeof props.className === 'string' ? props.className : undefined;
  const imgStyle = typeof props.style === 'object' ? (props.style as CSSProperties) : undefined;
  const imgWidth = typeof props.width === 'number' || typeof props.width === 'string' ? props.width : undefined;
  const imgHeight = typeof props.height === 'number' || typeof props.height === 'string' ? props.height : undefined;

  if (errored) {
    // Render a plain image element when Next/Image fails — keeps layout stable.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={alt ?? ''}
        className={imgClassName}
        style={imgStyle}
        width={imgWidth}
        height={imgHeight}
      />
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt ?? ''}
      onError={(event) => {
        try {
          logAssetFailure({
            ts: Date.now(),
            type: 'image',
            src: getImageSource(src, fallback),
            message: event?.type ?? 'error',
          });
        } catch {}
        setErrored(true);
      }}
    />
  );
}
