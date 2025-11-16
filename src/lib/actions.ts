
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { initializeFirebaseOnServer } from "@/firebase/server-init";
import { getAuth } from "firebase-admin/auth";
import { revalidatePath } from "next/cache";

const ADMIN_COOKIE_NAME = "admin-auth";
const ADMIN_PASSWORD = "q1w2e3r4"; // The password you requested

async function getFirebaseAdminAuth() {
    const { serverApp } = initializeFirebaseOnServer();
    return getAuth(serverApp);
}

export async function handleAdminLogin(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | void> {

  const password = formData.get("password") as string;

  if (password !== ADMIN_PASSWORD) {
    return { error: "كلمة المرور غير صحيحة." };
  }

  cookies().set(ADMIN_COOKIE_NAME, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });
  
  redirect("/admin/dashboard");
}

export async function handleAdminLogout() {
    cookies().delete(ADMIN_COOKIE_NAME);
    redirect("/");
}

export async function handleEmailLogin(
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Server-side validation can be added here
    if (!email || !password) {
        return { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." };
    }

    // Since Firebase client SDK handles login, this action mainly serves
    // to trigger the form submission and re-route if needed.
    // The actual authentication is client-side. We return null and let the client handle it.
    // We could add server-side checks if necessary but that requires admin SDK.
    return { error: "حدث خطأ غير متوقع. حاول مرة أخرى." };
}

export async function handleEmailSignup(
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!name || !email || !password) {
        return { error: "يرجى ملء جميع الحقول." };
    }

    // Similar to login, client handles creation, this action is for validation.
    // It's a good place to add more complex server-side validation if needed.
    return { error: "حدث خطأ غير متوقع. حاول مرة أخرى." };
}
