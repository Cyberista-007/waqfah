
import { Youtube } from 'lucide-react';

export default function ChannelsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 font-headline flex items-center gap-3">
        <Youtube className="h-10 w-10" />
        القنوات
      </h1>
      <div className="text-center py-16 border-2 border-dashed rounded-xl">
        <p className="text-lg text-muted-foreground">
            سيتم عرض قائمة بالقنوات هنا قريبًا.
        </p>
      </div>
    </div>
  );
}

    