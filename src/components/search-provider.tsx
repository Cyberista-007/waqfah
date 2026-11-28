'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ImmersiveSearch = dynamic(
  () => import('./immersive-search').then((mod) => mod.ImmersiveSearch),
  { ssr: false }
);

interface SearchContextType {
  openSearch: () => void;
  closeSearch: () => void;
  isSearchOpen: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasLoadedSearch, setHasLoadedSearch] = useState(false);

  const openSearch = useCallback(() => {
    setHasLoadedSearch(true);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }

      if (e.key === '/' && !isSearchOpen) {
        e.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, openSearch]);

  return (
    <SearchContext.Provider value={{ openSearch, closeSearch, isSearchOpen }}>
      {children}
      {(hasLoadedSearch || isSearchOpen) && (
        <ImmersiveSearch isOpen={isSearchOpen} onClose={closeSearch} />
      )}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
