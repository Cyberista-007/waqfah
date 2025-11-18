
"use client";

import { useEffect } from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// This page now just redirects to the main login page.
// The concept of a separate "admin login" is removed.
// Access control is handled by the admin layout based on the logged-in user.
export default function AdminLoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, send them to the dashboard.
    // Otherwise, send them to the main login page.
    if (!isUserLoading) {
      if (user) {
        router.replace('/admin/dashboard');
      } else {
        // Pass a redirect parameter so the main login knows where to send the user back.
        router.replace('/auth/login?redirect_to=/admin/dashboard');
      }
    }
  }, [user, isUserLoading, router]);

  // Show a loader while figuring out where to go.
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin" />
    </div>
  );
}
