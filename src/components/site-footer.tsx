import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SiteFooter() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12 pt-12">
      <div className="container mx-auto px-6 pb-8">
        <div className="max-w-xl mx-auto text-center mb-10">
          <h3 className="text-2xl font-semibold text-white mb-4 font-headline">
            اشترك في النشرة البريدية
          </h3>
          <p className="text-gray-400 mb-6">
            احصل على آخر المحاضرات والسلاسل مباشرة في بريدك الإلكتروني.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني..."
              className="flex-grow p-3 rounded-lg border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-ring"
              aria-label="البريد الإلكتروني للنشرة البريدية"
            />
            <Button
              type="submit"
              className="bg-primary/80 text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              اشتراك
            </Button>
          </form>
        </div>

        <div className="border-t border-gray-700"></div>

        <div className="text-center pt-8">
          <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة | موقع أمجد سمير.</p>
          <p className="text-sm text-gray-400">
            هذا الموقع هو تصميم مبدئي لأغراض العرض.
          </p>
          <div className="mt-4 space-x-4 space-x-reverse">
             <Button variant="link" className="text-gray-400 hover:text-white text-sm hover:underline">
                English
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
