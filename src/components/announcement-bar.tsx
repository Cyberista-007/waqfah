'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  text: string;
  link?: string;
}

export function AnnouncementBar({ text, link }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ANNOUNCEMENT_KEY = `announcement_dismissed_${text.slice(0, 20)}`;

  useEffect(() => {
    const isDismissed = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [ANNOUNCEMENT_KEY]);

  const handleDismiss = () => {
    localStorage.setItem(ANNOUNCEMENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }
  
  const BarContent = () => (
    <div className="flex items-center gap-x-3">
        <Megaphone className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm font-medium">{text}</p>
    </div>
  );

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-primary/20 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      {link ? (
        <Link href={link} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center hover:underline">
          <BarContent />
        </Link>
      ) : (
        <div className="flex-1 flex items-center justify-center">
            <BarContent />
        </div>
      )}
      <div className="flex flex-1 justify-end">
        <Button onClick={handleDismiss} size="icon" variant="ghost" className="-m-3 h-8 w-8 focus-visible:outline-offset-[-4px]">
          <span className="sr-only">Dismiss</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
