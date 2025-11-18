import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SiteFooter() {
  return (
    <footer className="bg-card text-muted-foreground mt-12 pt-12 border-t border-border">
      <div className="container mx-auto px-6 pb-8">
        <div className="max-w-xl mx-auto text-center mb-10">
          <h3 className="text-2xl font-semibold text-foreground mb-4 font-headline">
            اشترك في النشرة البريدية
          </h3>
          <p className="text-muted-foreground mb-6">
            احصل على آخر المحاضرات والسلاسل مباشرة في بريدك الإلكتروني.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="أدخل بريدك الإلكتروني..."
              className="flex-grow p-3 rounded-lg text-foreground focus:ring-2 focus:ring-ring"
              aria-label="البريد الإلكتروني للنشرة البريدية"
            />
            <Button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              اشتراك
            </Button>
          </form>
        </div>

        <div className="border-t border-border/50"></div>

        <div className="text-center pt-8">
          <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة | موقع أمجد سمير.</p>
          <p className="text-sm text-muted-foreground">
            هذا الموقع هو تصميم مبدئي لأغراض العرض.
          </p>
          <div className="mt-4 space-x-4 space-x-reverse">
             <Button variant="link" className="text-muted-foreground hover:text-foreground text-sm hover:underline">
                English
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
