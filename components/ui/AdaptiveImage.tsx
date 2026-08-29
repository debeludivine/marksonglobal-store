'use client';

import Image, { ImageProps } from 'next/image';
import { useNetwork } from '../providers/NetworkProvider';

interface AdaptiveImageProps extends Omit<ImageProps, 'quality'> {
  // You can still pass priority, but we might override it on slow networks
}

export function AdaptiveImage(props: AdaptiveImageProps) {
  const { effectiveType } = useNetwork();

  // Determine quality based on network speed
  let dynamicQuality = 85;
  if (effectiveType === '3g') dynamicQuality = 50;
  if (effectiveType === '2g' || effectiveType === 'slow-2g') dynamicQuality = 20;

  // On very slow networks, strip out priority (eager loading) to save bandwidth for HTML/JS
  const isSlow = effectiveType === '2g' || effectiveType === 'slow-2g';
  const finalPriority = isSlow ? false : props.priority;
  
  // On slow networks, maybe we want to unoptimize entirely if we have a tiny blurry placeholder? 
  // Next.js image optimization is usually good, but passing a lower quality parameter is best.
  
  return (
    <Image
      {...props}
      quality={dynamicQuality}
      priority={finalPriority}
      loading={finalPriority ? undefined : 'lazy'}
    />
  );
}
