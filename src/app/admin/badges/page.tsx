
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { GamificationBadge } from "@/lib/types";
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { Loader2, Database, Trophy, Gem, BookOpen, Headphones, Film, Sparkles } from "lucide-react";
import { badges as badgesData } from '@/lib/badges-data';


const iconMap: { [key: string]: React.ElementType } = {
    Headphones,
    BookOpen,
    Film,
    Sparkles,
    Gem,
    Trophy
};


export default function AdminBadgesPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { data: existingBadges, isLoading } = useCollection<GamificationBadge>('gamification_badges');
    const [isSeeding, setIsSeeding] = useState(false);
    
    const existingBadgeIds = new Set(existingBadges?.map(b => b.id));
    const badgesToSeed = badgesData.filter(b => !existingBadgeIds.has(b.id));

    const handleSeedBadges = async () => {
        if (!firestore || badgesToSeed.length === 0) return;
        
        setIsSeeding(true);
        try {
            const batch = writeBatch(firestore);
            const badgesCollection = collection(firestore, 'gamification_badges');
            
            badgesToSeed.forEach(badge => {
                const docRef = doc(badgesCollection, badge.id);
                batch.set(docRef, badge);
            });

            await batch.commit();
            toast({
                title: "تمت إضافة الأوسمة بنجاح!",
                description: `تمت إضافة ${badgesToSeed.length} وسام جديد إلى قاعدة البيانات.`,
            });
        } catch (error) {
             console.error("Error seeding badges:", error);
             toast({
                variant: "destructive",
                title: "فشل في إضافة الأوسمة",
             });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
            <CardTitle className="text-2xl font-headline flex items-center gap-2"><Trophy/>إدارة الأوسمة</CardTitle>
            <CardDescription>
                عرض وإضافة الأوسمة المتاحة في النظام.
            </CardDescription>
            </div>
            <Button onClick={handleSeedBadges} disabled={isLoading || isSeeding || badgesToSeed.length === 0}>
              {(isLoading || isSeeding) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              {badgesToSeed.length > 0 ? `إضافة ${badgesToSeed.length} أوسمة جديدة` : 'لا توجد أوسمة جديدة'}
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>الوسام</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الشرط</TableHead>
                <TableHead>النقاط</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : existingBadges?.map((badge) => {
                    const Icon = iconMap[badge.icon] || Trophy;
                    return (
                        <TableRow key={badge.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-amber-500" />
                                    <span>{badge.title}</span>
                                </div>
                            </TableCell>
                            <TableCell>{badge.description}</TableCell>
                            <TableCell>{badge.threshold} {badge.metric}</TableCell>
                            <TableCell>{badge.points}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
            {!isLoading && !existingBadges?.length && (
              <p className="py-8 text-center text-muted-foreground">لم تتم إضافة أي أوسمة بعد. انقر على زر الإضافة لتبدأ.</p>
            )}
        </CardContent>
        </Card>
    );
}
