
"use client";

import { Trophy, Award, Loader2, Sparkles, Medal, User, Crown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCollection, useUser } from '@/firebase';
import type { UserProfile, GamificationBadge, UserBadge } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBadgeManager } from '@/hooks/useBadgeManager';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import { useMemo } from 'react';
import { iconMap } from '@/lib/icon-map';

function BadgeItem({ badge, earned }: { badge: GamificationBadge, earned: boolean }) {
    const Icon = iconMap[badge.icon] || Sparkles;

    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "flex flex-col items-center justify-center text-center p-4 rounded-xl border-2 transition-all duration-300",
                        earned ? "border-amber-400 bg-amber-400/10" : "border-transparent bg-muted/50"
                    )}>
                        <div className={cn(
                            "flex items-center justify-center h-16 w-16 rounded-full mb-3",
                             earned ? "bg-amber-400 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                            <Icon className="h-8 w-8" />
                        </div>
                        <h4 className="font-bold text-sm">{badge.title}</h4>
                         <p className="text-xs text-muted-foreground mt-1">+{badge.points} نقطة</p>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p>{badge.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function LeaderboardPage() {
    const { user } = useUser();
    useBadgeManager();

    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>('users', { orderBy: ['points', 'desc'], limit: 100 });
    const { data: allBadges, isLoading: allBadgesLoading } = useCollection<GamificationBadge>('gamification_badges', { orderBy: ['points', 'asc'] });
    const userBadgesPath = user ? `users/${user.uid}/user_badges` : null;
    const { data: earnedBadges, isLoading: userBadgesLoading } = useCollection<UserBadge>(userBadgesPath);
    
    const isLoading = usersLoading || allBadgesLoading || (user && userBadgesLoading);
    
    const userRank = useMemo(() => {
        if (!user || !users) return null;
        const rank = users.findIndex(u => u.id === user.uid);
        return rank !== -1 ? rank + 1 : null;
    }, [user, users]);

    const earnedBadgeIds = useMemo(() => new Set(earnedBadges?.map(b => b.id) || []), [earnedBadges]);
    
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }

    return (
      <div className="py-8">
        <header className="text-center mb-12">
            <Trophy className="mx-auto h-16 w-16 text-amber-500 animate-icon-draw" />
            <h1 className="text-5xl font-extrabold mt-4 mb-3 font-headline tracking-tight">لوحة الصدارة</h1>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
                تنافس في الخيرات واجمع النقاط والأوسمة من خلال استماعك للمحاضرات وإتمامك للعبادات.
            </p>
        </header>

        <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
                <TabsTrigger value="leaderboard"><Medal className="me-2 h-4 w-4"/>المتصدرون</TabsTrigger>
                <TabsTrigger value="all-badges"><Award className="me-2 h-4 w-4"/>كل الأوسمة</TabsTrigger>
                <TabsTrigger value="my-badges"><Sparkles className="me-2 h-4 w-4"/>أوسمتي</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>أفضل 100 مستخدم</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">الترتيب</TableHead>
                                    <TableHead>المستخدم</TableHead>
                                    <TableHead className="text-right">النقاط</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((u, index) => (
                                    <TableRow key={u.id} className={cn(
                                        user && u.id === user.uid && "bg-primary/10"
                                    )}>
                                        <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={u.photoURL} alt={u.name} />
                                                    <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold">{u.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-lg">{u.points || 0}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {user && userRank && (
                            <div className="mt-4 p-4 bg-muted rounded-lg text-center font-bold">
                                ترتيبك الحالي: <span className="text-primary text-xl">#{userRank}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="all-badges" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>جميع الأوسمة المتاحة</CardTitle>
                        <CardDescription>أكمل المهام المطلوبة لتحصل على هذه الأوسمة وتزيد من نقاطك.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allBadges?.map(badge => (
                            <BadgeItem key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} />
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="my-badges" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>الأوسمة التي حصلت عليها</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {earnedBadges && earnedBadges.length > 0 ? (
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {allBadges?.filter(b => earnedBadgeIds.has(b.id)).map(badge => (
                                    <BadgeItem key={badge.id} badge={badge} earned={true} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-lg text-muted-foreground">لم تحصل على أي أوسمة بعد. ابدأ رحلتك الآن!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
    )
}

export default LeaderboardPage;
