'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

export function HomeSearch() {
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="search"
              name="search"
              placeholder="ابحث عن محاضرة، سلسلة، كتاب..."
              className="w-full p-6 pe-12 text-lg rounded-full shadow-lg focus:ring-2 focus:ring-ring border-2 border-transparent focus:border-primary transition-all duration-300 text-foreground"
              aria-label="بحث"
            />
            <button type="submit" className="absolute top-1/2 end-4 -translate-y-1/2 text-muted-foreground">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </form>
    </div>
  );
}
