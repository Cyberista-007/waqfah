"use client";

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
import { useCollection, useFirestore, useUser } from "@/firebase";
import type { UserProfile } from "@/lib/types";
import { Loader2, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";


export default function AdminUsersPage() {
    const { user: currentUser } = useUser();
    const { isAdmin } = useAdminAuth();
    const { data: allUsers, isLoading } = useCollection<UserProfile>('users', { orderBy: ['createdAt', 'desc'] });

    return (
        <Card>
        <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <UserCog />
                إدارة المستخدمين
            </CardTitle>
            <CardDescription>
                عرض المستخدمين المسجلين في الموقع.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead className="hidden md:table-cell">البريد الإلكتروني</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead className="hidden md:table-cell">تاريخ التسجيل</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : allUsers?.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                             <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ''} alt={user.name} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                             {user.id === currentUser?.uid && <Badge variant="secondary" className="mt-1">أنت</Badge>}
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell>
                        {user.role === 'admin' 
                            ? <Badge>مدير</Badge> 
                            : <Badge variant="outline">مستخدم</Badge>
                        }
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {user.createdAt ? format(user.createdAt.toDate(), 'yyyy/MM/dd') : 'غير معروف'}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {!isLoading && !allUsers?.length && (
              <p className="py-8 text-center text-muted-foreground">لا يوجد مستخدمون مسجلون بعد.</p>
            )}
        </CardContent>
        </Card>
    );
}
