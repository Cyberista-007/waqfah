'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full p-0 border-0 bg-transparent shadow-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
