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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}


export default function AdminUsersPage() {
    const { user: currentUser } = useUser();
    const { data: allUsers, isLoading } = useCollection<UserProfile>('users', { orderBy: ['createdAt', 'desc'] });
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
        if (!firestore) return;

        const userRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userRef, { role: newRole });

        toast({
            title: "تم تحديث الدور",
            description: `تم تغيير دور المستخدم بنجاح إلى ${newRole}.`,
        });
    };

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
                        </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        {user.createdAt ? format(user.createdAt.toDate(), 'yyyy/MM/dd') : 'غير معروف'}
                    </TableCell>
                    <TableCell>
                       <Select
                          defaultValue={user.role || 'user'}
                          onValueChange={(value: 'admin' | 'user') => handleRoleChange(user.id, value)}
                          disabled={user.id === currentUser?.uid}
                       >
                           <SelectTrigger className="w-[120px]">
                               <SelectValue/>
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="user">مستخدم</SelectItem>
                               <SelectItem value="admin">مدير</SelectItem>
                           </SelectContent>
                       </Select>
                       {user.id === currentUser?.uid && <Badge variant="secondary" className="mt-1">أنت</Badge>}
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
