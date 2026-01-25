
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
import { useAuth, useFirestore, useStorage } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, EditProfileForm as EditProfileFormType } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { User, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';

interface EditProfileFormProps {
  user: User;
  userProfile: UserProfile;
  onClose: () => void;
}

export function EditProfileForm({ user, userProfile, onClose }: EditProfileFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const storage = useStorage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user.photoURL || userProfile.photoURL || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !auth?.currentUser || !storage) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Omit<EditProfileFormType, 'photoURL'> & { name: string; bio: string };
    
    let newPhotoURL = user.photoURL || userProfile.photoURL || '';

    try {
        // Upload image if a new one is selected
        if (imageFile) {
            const imageRef = ref(storage, `profile-images/${user.uid}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            newPhotoURL = await getDownloadURL(snapshot.ref);
        }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: data.name,
        photoURL: newPhotoURL,
      });

      // Update Firestore document
      const userRef = doc(firestore, 'users', user.uid);
      await updateDocumentNonBlocking(userRef, {
        name: data.name,
        bio: data.bio,
        photoURL: newPhotoURL,
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
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview || undefined} />
                    <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="photoFile">تغيير الصورة</Label>
                  <Input
                    id="photoFile"
                    name="photoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </div>
            </div>
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
