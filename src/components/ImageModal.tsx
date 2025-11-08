

import { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogClose } from '@/components/ui/dialog';
import { ZoomIn, ZoomOut, X as XIcon } from 'lucide-react';

interface ImageModalProps {
  images: string[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImageModal({ images, index, open, onOpenChange }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [current, setCurrent] = useState(index);

  // sync index when modal opens
  if (open && current !== index) {
    setCurrent(index);
    setZoom(1);
  }

  const inc = () => setZoom((z) => Math.min(3, z + 0.25));
  const dec = () => setZoom((z) => Math.max(0.5, z - 0.25));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={dec} className="rounded border px-2 py-1">
              <ZoomOut />
            </button>
            <button onClick={inc} className="rounded border px-2 py-1">
              <ZoomIn />
            </button>
          </div>
          <DialogClose asChild>
            <button className="rounded border px-2 py-1"><XIcon /></button>
          </DialogClose>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="max-h-[70vh] max-w-full overflow-auto">
            <img
              src={images[current]}
              alt={`modal-${current}`}
              style={{ transform: `scale(${zoom})` }}
              className="mx-auto max-h-[70vh] object-contain"
            />
          </div>
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`h-12 w-12 overflow-hidden rounded-md ${i === current ? 'ring-2 ring-primary' : 'border'}`}>
                <img src={img} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
