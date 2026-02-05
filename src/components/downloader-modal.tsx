'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function DownloaderModal({ isOpen, onClose, videoUrl }: DownloaderModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const downloadServiceUrl = `https://savefrom.net/${videoUrl}`;

  if (!videoUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full h-[80vh] p-0 flex flex-col"
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle>تحميل الفيديو</DialogTitle>
          <DialogDescription>
            استخدم الواجهة أدناه لتنزيل الفيديو. قد تحتوي الخدمة الخارجية على إعلانات.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ms-2">جاري تحميل أداة التنزيل...</p>
            </div>
          )}
          <iframe
            src={downloadServiceUrl}
            className="w-full h-full border-0"
            title="Video Downloader"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms" // For security
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
