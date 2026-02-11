'use client';
import React, { useMemo } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  
    const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];

    const delta = 2; // Pages to show on each side of the current page
    const range: number[] = [];
    const rangeWithDots: (string | number)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);
  
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-md gap-1"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronRight className="h-4 w-4" />
        <span>السابق</span>
      </Button>

      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="flex h-9 w-9 items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              className="rounded-md w-9 h-9"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="rounded-md gap-1"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span>التالي</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </nav>
  );
}
