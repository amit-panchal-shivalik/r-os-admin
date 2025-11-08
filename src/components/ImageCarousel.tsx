

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export default function ImageCarousel({ images, onImageClick }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="relative">
      <div className="h-48 w-full overflow-hidden rounded-lg">
        <img
          src={images[index]}
          alt={`image-${index}`}
          className="h-full w-full object-cover cursor-pointer"
          onClick={() => onImageClick?.(index)}
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            <ChevronRight />
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setIndex(i)}
              className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border ${i === index ? 'ring-2 ring-primary' : ''}`}
            >
              <img src={img} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
