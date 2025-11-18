
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Book, Clapperboard, Home, ListVideo, MessageSquare, Users, LogOut, Loader2, Hash, HelpCircle, CalendarClock, Upload, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && firestore) {
        try {
          const usersQuery = query(collection(firestore, 'users'), orderBy('createdAt', 'asc'), limit(1));
          const querySnapshot = await getDocs(usersQuery);
          if (!querySnapshot.empty) {
            const firstUser = querySnapshot.docs[0];
            if (firstUser.id === user.uid) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
            setIsCheckingAdmin(false);
        }
      } else if (!isUserLoading) {
        // If there's no user and we are not loading, they are definitely not an admin.
        setIsCheckingAdmin(false);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, firestore, isUserLoading]);


  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/');
    }
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: Home },
    { href: '/admin/lectures', label: 'المحاضرات', icon: Clapperboard },
    { href: '/admin/series', label: 'السلاسل', icon: ListVideo },
    { href: '/admin/books', label: 'الكتب', icon: Book },
    { href: '/admin/topics', label: 'المواضيع', icon: Hash },
    { href: '/admin/comments', label: 'التعليقات', icon: MessageSquare },
    { href: '/admin/schedule', label: 'جدول الدروس', icon: CalendarClock },
    { href: '/admin/qa', label: 'سؤال وجواب', icon: HelpCircle },
    { href: '/admin/users', label: 'المستخدمون', icon: UserCog },
    { href: '/admin/lectures/import', label: 'استيراد', icon: Upload },
  ];
  
    if (isUserLoading || isCheckingAdmin) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin" />
          </div>
      )
  }
  
  if (!user) {
    // This effect will run on the client side to redirect.
    if (typeof window !== 'undefined') {
       router.push('/admin/login');
    }
    // Return a loading state while redirecting to prevent flash of content.
    return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
             <Loader2 className="h-16 w-16 animate-spin" />
            <p>إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
        </div>
    )
  }

  if (!isAdmin) {
      // This effect will run on the client side to redirect.
      if (typeof window !== 'undefined') {
        router.push('/');
      }
      // Return a loading state to prevent flash of content.
      return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
             <Loader2 className="h-16 w-16 animate-spin" />
            <p>غير مصرح لك بالدخول. جارِ إعادة التوجيه...</p>
        </div>
    )
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <Users className="h-6 w-6" />
              <span className="">لوحة التحكم</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  
                  return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                           isActive ? "bg-primary/10 text-primary" : ""
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                  )
              })}
            </nav>
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
         {/* This is a simplified header for mobile. 
             A full implementation would have a Sheet component for the nav.
          */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <Users className="h-6 w-6" />
                <span className="">لوحة التحكم</span>
            </Link>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
