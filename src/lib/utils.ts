
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function formatDuration(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

export function formatTotalDuration(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) {
    return '';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} ساعة`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} دقيقة`);
  }
  
  if (parts.length === 0 && totalSeconds > 0) {
      return `أقل من دقيقة`;
  }

  return parts.join(' و ');
}
