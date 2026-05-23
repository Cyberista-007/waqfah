"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRing, Check, Trash2, X, Loader2, Info, MessageSquare, BookOpen, Star } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { doc, writeBatch, Timestamp, collection, query, orderBy, limit, deleteDoc, updateDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href?: string;
  isRead: boolean;
  createdAt: any; // Firestore Timestamp
  type: "new_lecture" | "series_complete" | "general" | "update";
};

export function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const notificationsPath = user ? `users/${user.uid}/notifications` : null;
  const { data: notifications, isLoading } = useCollection<NotificationItem>(
    notificationsPath,
    { orderBy: ["createdAt", "desc"], limit: 30 }
  );

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const markAllRead = useCallback(async () => {
    if (!firestore || !user || !notifications?.length) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length) return;

    const batch = writeBatch(firestore);
    unread.forEach((n) => {
      const ref = doc(firestore, `users/${user.uid}/notifications/${n.id}`);
      batch.update(ref, { isRead: true });
    });
    try {
      await batch.commit();
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  }, [firestore, user, notifications]);

  const markRead = async (id: string) => {
    if (!firestore || !user) return;
    try {
      const ref = doc(firestore, `users/${user.uid}/notifications/${id}`);
      await updateDoc(ref, { isRead: true });
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  const deleteOne = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firestore || !user) return;
    try {
      const ref = doc(firestore, `users/${user.uid}/notifications/${id}`);
      await deleteDoc(ref);
    } catch (e) {
      console.error("Failed to delete notification:", e);
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "new_lecture": return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "series_complete": return <Star className="h-4 w-4 text-yellow-500" />;
      case "update": return <Info className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={(o) => { 
        setOpen(o); 
        if (o && unreadCount > 0) markAllRead(); 
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 animate-[bell-ring_1s_ease-in-out_infinite] text-primary" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[350px] p-0 rounded-2xl overflow-hidden shadow-2xl border-border/50 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card/80">
          <div className="flex items-center gap-2">
            <h3 className="font-bold font-headline text-lg">الإشعارات</h3>
            {unreadCount > 0 && <Badge className="rounded-full px-2 py-0 text-[10px] h-4">{unreadCount} جديد</Badge>}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary" onClick={markAllRead}>
               <Check className="h-3 w-3 me-1" /> قراءة الكل
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications?.length ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
               <Bell className="h-10 w-10 opacity-20" />
               <p className="text-sm">لا توجد إشعارات حاليًا</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div key={notif.id} className="relative group">
                    <Link 
                    href={notif.href || "#"} 
                    className={cn(
                        "flex items-start gap-4 p-4 transition-colors",
                        notif.isRead ? "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"
                    )}
                    onClick={() => {
                        markRead(notif.id);
                        setOpen(false);
                    }}
                    >
                    <div className={cn(
                        "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50",
                        !notif.isRead ? "bg-primary/20 text-primary border-primary/30" : "bg-muted"
                    )}>
                        {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold leading-tight">{notif.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
                        <p className="text-[10px] text-muted-foreground/60">
                        {notif.createdAt ? formatDistanceToNow(typeof (notif.createdAt as any).toDate === 'function' ? (notif.createdAt as any).toDate() : new Date(notif.createdAt as any), { addSuffix: true, locale: ar }) : "الآن"}
                        </p>
                    </div>
                    {!notif.isRead && <span className="absolute top-4 right-2 w-2 h-2 rounded-full bg-primary" />}
                    </Link>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute left-2 bottom-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:bg-destructive/10 hover:text-destructive z-10"
                        onClick={(e) => deleteOne(e, notif.id)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border/40 text-center bg-card/50">
           <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">مشاهدة جميع الإشعارات</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
