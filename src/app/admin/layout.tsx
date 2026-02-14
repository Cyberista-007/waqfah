
'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlertTriangle, Book, CalendarClock, Clapperboard, Flame, Hash, Heart, HelpCircle,
  LayoutDashboard, ListVideo, Loader2, LogOut, Megaphone, Palette, Pin, Podcast,
  ShieldX, Upload, UserCog, Youtube, GripVertical, Trophy
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define type for nav items
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

// Sortable Nav Item Component
const SortableNavItem = ({ item }: { item: NavItem }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.href });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 group">
      <Link
        href={item.href}
        className={cn(
          "flex-grow flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive ? "bg-primary/10 text-primary" : ""
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
      <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
};


const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading } = useAdminAuth();
  const auth = useAuth();
  
  const initialNavItems: NavItem[] = [
      // Overview
      { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
      
      // Content Management
      { href: '/admin/programs', label: 'البرامج', icon: Podcast },
      { href: '/admin/channels', label: 'القنوات', icon: Youtube },
      { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
      { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
      { href: '/admin/books', label: 'الكتب', icon: Book },
      
      // Content Organization
      { href: '/admin/topics', label: 'المواضيع', icon: Hash },
      { href: '/admin/pinned', label: 'العناصر المثبتة', icon: Pin },

      // Feature Management
      { href: '/admin/challenges', label: 'التحديات', icon: Flame },
      { href: '/admin/badges', label: 'الأوسمة', icon: Trophy },
      { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
      { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
      { href: '/admin/sins', label: 'إدارة المهلكات', icon: AlertTriangle },

      // Site Administration
      { href: '/admin/appearance', label: 'المظهر', icon: Palette },
      { href: '/admin/announcement', label: 'الإعلان', icon: Megaphone },
      { href: '/admin/donations', label: 'إدارة التبرعات', icon: Heart },
      { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
      { href: '/admin/lectures/import', label: 'استيراد', icon: Upload },
    ];

  const [orderedNavItems, setOrderedNavItems] = useState<NavItem[]>(initialNavItems);

  useEffect(() => {
    try {
      const savedOrderJSON = localStorage.getItem('adminNavOrder');
      if (savedOrderJSON) {
        const savedOrder: string[] = JSON.parse(savedOrderJSON);
        const itemsMap = new Map(initialNavItems.map(item => [item.href, item]));
        const newOrderedItems = savedOrder
          .map(href => itemsMap.get(href))
          .filter((item): item is NavItem => !!item);
        
        initialNavItems.forEach(item => {
          if (!newOrderedItems.find(orderedItem => orderedItem.href === item.href)) {
            newOrderedItems.push(item);
          }
        });

        setOrderedNavItems(newOrderedItems);
      }
    } catch (e) {
      console.error("Failed to load or parse nav order from localStorage", e);
      setOrderedNavItems(initialNavItems);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedNavItems((items) => {
        const oldIndex = items.findIndex((item) => item.href === active.id);
        const newIndex = items.findIndex((item) => item.href === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        try {
          const orderToSave = newOrder.map(item => item.href);
          localStorage.setItem('adminNavOrder', JSON.stringify(orderToSave));
        } catch(e) {
          console.error("Failed to save nav order to localStorage", e);
        }

        return newOrder;
      });
    }
  }, []);

  
  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/');
  }

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    )
  }

  if (isAdmin) {
      return (
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-r bg-muted/40 md:block">
              <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="">لوحة التحكم</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={orderedNavItems.map(item => item.href)} strategy={verticalListSortingStrategy}>
                      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {orderedNavItems.map(item => (
                            <SortableNavItem key={item.href} item={item} />
                        ))}
                      </nav>
                    </SortableContext>
                  </DndContext>
                </div>
                <div className="mt-auto p-4 space-y-2">
                      <Button onClick={handleLogout} size="sm" variant="outline" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        تسجيل الخروج
                      </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/">العودة للموقع</Link>
                  </Button>
                </div>
              </div>
            </aside>
            <div className="flex flex-col">
              <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
                  <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                      <LayoutDashboard className="h-6 w-6" />
                      <span className="">لوحة التحكم</span>
                  </Link>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 rounded-xl">
                {children}
              </main>
            </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center p-4">
        <ShieldX className="w-24 h-24 text-destructive mb-4"/>
        <h1 className="text-3xl font-bold font-headline mb-2">الوصول مرفوض</h1>
        <p className="text-lg text-muted-foreground mb-6">
            عذراً، هذه المنطقة مخصصة للمدير فقط.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
           <Button asChild variant="secondary">
            <Link href="/auth/login">تسجيل الدخول</Link>
          </Button>
        </div>
    </div>
  );
};

export default AdminLayout;
