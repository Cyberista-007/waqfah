
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
import { useCollection } from "@/firebase";
import type { UserProfile } from "@/lib/types";
import { Loader2, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}


export default function AdminUsersPage() {
    const { data: allUsers, isLoading } = useCollection<UserProfile>('users', { orderBy: ['createdAt', 'desc'] });

    return (
        <Card>
        <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <UserCog />
                إدارة المستخدمين
            </CardTitle>
            <CardDescription>
                عرض المستخدمين المسجلين في الموقع وإدارة أدوارهم.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
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
                        </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        {user.createdAt ? format(user.createdAt.toDate(), 'yyyy/MM/dd') : 'غير معروف'}
                    </TableCell>
                    <TableCell>
                        {/* Placeholder for role - to be implemented */}
                        <span className="text-muted-foreground">مستخدم</span>
                    </TableCell>
                    <TableCell className="text-left">
                        <Button variant="outline" size="sm" disabled>
                            تعديل
                        </Button>
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
