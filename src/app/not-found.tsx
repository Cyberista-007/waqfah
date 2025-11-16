import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <SearchX className="w-24 h-24 mb-4 text-destructive" />
      <h2 className="text-4xl font-bold mb-2 font-headline">الصفحة غير موجودة</h2>
      <p className="text-lg text-muted-foreground mb-6">
        عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.
      </p>
      <Button asChild size="lg">
        <Link href="/">العودة إلى الصفحة الرئيسية</Link>
      </Button>
    </div>
  );
}
