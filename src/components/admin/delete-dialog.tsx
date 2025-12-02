
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    children?: React.ReactNode; // To wrap a trigger button
    confirmButtonText?: string;
}

export function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    children,
    confirmButtonText = "نعم، قم بالحذف"
}: DeleteConfirmationDialogProps) {

  const content = (
    <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm}>{confirmButtonText}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
  );

  if (children) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogTrigger asChild>
            {children}
        </AlertDialogTrigger>
        {content}
      </AlertDialog>
    )
  }

  // For controlled dialogs without an explicit trigger
  return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        {content}
      </AlertDialog>
  );
}
