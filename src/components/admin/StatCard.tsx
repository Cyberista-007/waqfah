import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  isLoading: boolean;
}

export function StatCard({ title, value, icon: Icon, isLoading }: StatCardProps) {
  return (
    <Card className="rounded-2xl luxury-card border-border/70 p-5 flex flex-col justify-between gap-3">
      <CardHeader className="flex flex-row items-center justify-between p-0">
        <CardTitle className="text-xs font-bold text-muted-foreground font-headline">{title}</CardTitle>
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
        ) : (
          <p className="text-3xl font-black font-mono text-foreground tracking-tight">
            {value.toLocaleString('ar-EG')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
