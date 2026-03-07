
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    isLoading: boolean;
}

export function StatCard({ title, value, icon: Icon, isLoading }: StatCardProps) {
    return (
        <Card className="rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-headline">{title}</CardTitle>
                <Icon className="w-5 h-5 text-muted-foreground animate-icon-draw" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <p className="text-3xl font-bold">{value}</p>}
            </CardContent>
        </Card>
    );
}
