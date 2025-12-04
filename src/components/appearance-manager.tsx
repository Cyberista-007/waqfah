
'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAppearance } from './appearance-provider';
import { useToast } from '@/hooks/use-toast';

export function AppearanceManager() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { setBackground } = useAppearance();
    const { toast } = useToast();

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                variant: 'destructive',
                title: 'حجم الملف كبير جدًا',
                description: 'يرجى اختيار صورة أصغر من 5 ميجابايت.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                setBackground(result);
                toast({
                    title: 'تم تغيير الخلفية بنجاح!',
                });
            }
        };
        reader.onerror = () => {
            toast({
                variant: 'destructive',
                title: 'خطأ في قراءة الملف',
                description: 'لم نتمكن من قراءة الملف الذي اخترته.',
            });
        };
        reader.readAsDataURL(file);
        
        // Reset the input value to allow re-uploading the same file
        if(event.target) {
            event.target.value = '';
        }
    }, [setBackground, toast]);

    const triggerFileUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);
    
    // We can add a global event listener or another way to trigger this
    // For now, it's just a hidden input. The trigger is in the site-header.
    useEffect(() => {
        // You could potentially set up a global event bus to trigger this
        // e.g., window.addEventListener('upload-background', triggerFileUpload);
        // return () => window.removeEventListener('upload-background', triggerFileUpload);
    }, [triggerFileUpload]);


    return (
        <input
            id="background-uploader-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif, image/webp"
            className="hidden"
        />
    );
}
