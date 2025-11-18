
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, EditProfileForm } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User, updateProfile } from 'firebase/auth';

interface EditProfileFormProps {
  user: User;
  userProfile: UserProfile;
  onClose: () => void;
}

export function EditProfileForm({ user, userProfile, onClose }: EditProfileFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !auth?.currentUser) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as EditProfileForm;

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: data.photoURL,
      });

      // Update Firestore document
      const userRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userRef, {
        name: data.name,
        bio: data.bio,
        photoURL: data.photoURL,
      });

      toast({
        title: 'تم تحديث الملف الشخصي',
        description: 'تم حفظ تغييراتك بنجاح.',
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description:
          error.message || 'لم نتمكن من تحديث ملفك الشخصي. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">تعديل الملف الشخصي</CardTitle>
        <CardDescription>
          قم بتحديث بياناتك الشخصية هنا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.displayName || ''}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="bio">نبذة تعريفية</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={userProfile?.bio || ''}
              rows={3}
              placeholder="تحدث عن نفسك..."
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="photoURL">رابط الصورة الشخصية</Label>
            <Input
              id="photoURL"
              name="photoURL"
              type="url"
              defaultValue={user.photoURL || userProfile?.photoURL || ''}
              placeholder="https://example.com/image.png"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              حفظ التغييرات
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
